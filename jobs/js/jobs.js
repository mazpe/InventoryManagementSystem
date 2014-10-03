/**
 * @author Greivin
 */
var dsJobsType = null;
var typeJobs = null;
var dsData = null;

Ext.onReady(function() 
{
	Ext.QuickTips.init();

	// shorthand alias
    var fm = Ext.form;
		
    var	gridForm = new Ext.form.BasicForm(
		Ext.get("general-form"),
		{			
		}
	);	
		
	dsJobsType = new Ext.data.Store(
	{
		proxy: new Ext.data.HttpProxy({url:'/jobs/php/jobs_type_data.php', method:'post'}),
		reader: new Ext.data.JsonReader(
		{root:'data', id:'jobs_type'},
		[
			{name: 'id'},
			{name: 'name'}
		])
	});

	/*editor*/
	typeJobs = new Ext.form.ComboBox(
	{
	    store			: dsJobsType, 
	    displayField	: 'name',
		valueField		: 'id',
		editable		: false,
		forceSelection 	: true,
		allowBlank		: false,
		lazyRender		: true,
		mode			: 'local',
		fieldLabel		: 'Type',
	    triggerAction	: 'all',
	    emptyText		: 'Select a Type...',
	    selectOnFocus	: true
	});
	
	// create the Data Store
    dsData = new Ext.data.Store(
	{
        url: "/jobs/php/jobs_data.php",
    	method:'post',
        reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
                {name: 'id', type:'int'},
	    		{name: 'name', type:'string'},
				{name: 'desc', type:'string'},
				{name: 'type', type:'int'},
				{name: 'ref', type:'string'}
			]
        }),

        // turn on remote sorting
        remoteSort: false
    });
	
    dsData.setDefaultSort('name', 'asc');

	// the column model has information about grid columns
    // dataIndex maps the column to the specific data field in
    // the data store	
	
    var cm = new Ext.grid.ColumnModel([
    	new Ext.grid.RowNumberer(),
		{
		   id: 'name',
           header: "Job Name",
           dataIndex: 'name',
           editor: new Ext.form.TextField({allowBlank:false})
        },
        {
			header: 'Description',
			dataIndex: 'desc',
			editor: new Ext.form.TextField({allowBlank:false})
		}, 
		{		
			header: 'Type',			
			dataIndex: 'type',
			editor:	typeJobs,
			renderer: function(data) 
			{
				if (data != undefined )
				{
					var idx = typeJobs.store.find(typeJobs.valueField, data);
					
					var rec = typeJobs.store.getAt(idx);
					
					if(rec != undefined)
						return rec.get(typeJobs.displayField);
				}
			}
		},
		{
			header: 'Ref',
			dataIndex: 'ref',
			editor:	new fm.TextField({allowBlank: false})
		}
    ]);

    // by default columns are sortable
    cm.defaultSortable = true;

	var grid = new Ext.grid.EditorGridPanel(
	{        
        frame:true,
		region:'center',
        title:'Jobs',
        store: dsData,
        cm: cm,
        trackMouseOver:true,
        selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),
        stripeRows: true,
		//autoExpandColumn: 'name',
        loadMask: true,
        viewConfig: 
		{
            forceFit : false
        },       
        tbar:[
        {
			id			: 'add',
			icon		: '/images/application/file-add.png',				
			cls			: 'x-btn-text-icon',
            text		: 'Add',
			handler		: function ()
			{	
				showDetail(null);
			}
        },
		{
			text	:	'Save Changes',
			icon	:   '/images/application/save.png',				
			cls		:   'x-btn-text-icon',
			handler	:	function()
			{
	        	jsonData = "";
				
				for(i = 0; i < dsData.getCount(); i++) 
				{
					record = dsData.getAt(i);
					
					if(record.data.insert || record.dirty) 
						jsonData += Ext.util.JSON.encode(record.data) + ",";
				}
				
				if(jsonData.length > 0)
				{
					jsonData = "[" + jsonData.substring(0,jsonData.length-1) + "]";
					
					gridForm.submit(
						{
							waitMsg: 'Saving changes, please wait...',
							url:"/jobs/php/process_jobs.php",
							params:{data:jsonData},
							success:function(form, action) 
							{
								loadDataSource();								
							},
							failure: function(form, action) 
							{
								alert('Error processing the action.');
							}
						}
					);
				}				
				else
					alert('No changes to submit.');		
			}
		},
		{
			text	:	'Delete', 
			icon	: 	'/images/application/file-delete.png',				
			cls		: 	'x-btn-text-icon', 
			handler	:	function()
			{
					Ext.MessageBox.confirm('Confirm', 'Do you want to continue?', function(value)
					{
						var rows = grid.getSelectionModel().getSelections();
						
						if(rows.length > 0)
						{
							if(value == 'yes')
							{									
								var jsonData = '';
								
								for(var i = 0; i < rows.length; i++)
									jsonData += '{"delete":true, "id":"' + rows[i].data.id + '"}' + (rows.length == i + 1 ? "" : "," );

								jsonData = "[" + jsonData + "]";
								 
								gridForm.submit(
								{
									waitMsg: 'Deleting rows, please wait...',
									url:"/jobs/php/process_jobs.php",										
									params:{data:jsonData},
									success:function(form, action) 
									{
										loadDataSource();
									},
									failure: function(form, action) 
									{
										alert(action.result.message);					
									}
								});												
							}
						}
						else
							alert('Please select the rows before.');	
					});		
			}
		},
		{
			text	:	'Refresh', 
			icon	: 	'/images/application/refresh.png',				
			cls		: 	'x-btn-text-icon', 
			handler	:loadDataSource
		}]
    });

	var viewport = new Ext.Viewport(
	{
		layout: "border",
		items:[
		new Ext.BoxComponent(
		{ 
            region:'north',
            el: 'north',
			height:45    
        }),
		grid
		]
	});

    // trigger the data store load
	dsJobsType.on('load', loadDataSource);
	dsJobsType.load();
    
    function loadDataSource()	
    {	
    	dsData.load();
	}
});