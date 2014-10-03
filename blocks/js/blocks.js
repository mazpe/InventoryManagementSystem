/**
 * @author Greivin
 */
var dsData = null;

Ext.onReady(function() 
{
	Ext.QuickTips.init();

	// shorthand alias
    var fm = Ext.form;
	var win = null;
	var paging = null;
	
	var gridForm = new Ext.form.BasicForm(
		Ext.get("general-form"),
		{
			
		}
	);
	
    //create the Data Store
 	dsData = new Ext.data.Store(
	{
        // load using script tags for cross domain, if the data in on the same domain as
        // this page, an HttpProxy would be better
    	url: "/blocks/php/blocks_data.php",
    	method:'post',
        // create reader that reads the Topic records
        reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
                {name:'id', type:'int'}, 
				{name:'name', type:'int'}, 
				{name:'desc', type:'string'}
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
           header: "Name",
           dataIndex: 'name',
           editor: new Ext.form.TextField({allowBlank:false})
        },
		{
		   id: 'desc',
           header: "Description",
           dataIndex: 'desc',
           editor: new fm.TextField({allowBlank: true})
        }
    ]);

    // by default columns are sortable
    cm.defaultSortable = true;

	var grid = new Ext.grid.EditorGridPanel(
	{
        frame:true,
        title:'Blocks',
        store: dsData,
        cm: cm,
		region:'center',
        trackMouseOver:true,
        selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),
       	stripeRows: true,
		autoSizeColumns:true,
		autoSizeHeaders:true,
		autoExpandColumn: 'desc',
        loadMask: true,
        viewConfig: 
		{
            forceFit:false
        },       
        tbar:[
        {
			id			: 'add-blocks',
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
			icon	: '/images/application/save.png',				
			cls		: 'x-btn-text-icon',
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
							url:"/blocks/php/process_blocks.php",
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
			icon	: '/images/application/file-delete.png',				
			cls		: 'x-btn-text-icon',
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
									url:"/blocks/php/process_blocks.php",										
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
			icon	: '/images/application/refresh.png',				
			cls		: 'x-btn-text-icon',			
			handler	:loadDataSource
		}]
    });

	var viewport = new Ext.Viewport(
	{
		layout: "border",
		items:[
		new Ext.BoxComponent(
		{ // raw
            region:'north',
            el: 'north',
			height:45    
        }),
		grid
		]
	});

    // trigger the data store load
    dsData.load();
    
    function loadDataSource()	
    {	
    	dsData.load();
	}
});