/**
 * @author Greivin
 */
var dsVendor = null;
var dsData = null;

Ext.onReady(function() 
{
	Ext.QuickTips.init();

	// shorthand alias
    var fm = Ext.form;
	var win = null;
	var paging = null;
	var vendor = null;
	
	var gridForm = new Ext.form.BasicForm(
		Ext.get("general-form"),
		{
			
		}
	);

	dsVendorType = new Ext.data.Store(
	{
		proxy: new Ext.data.HttpProxy({url:'/vendors_type/php/vendors_type_data.php', method:'post'}),
		reader: new Ext.data.JsonReader(
		{root:'data', id:'vendors_type'},
		[
			{name: 'id'},
			{name: 'type_name'}
		])
	});

	/*editor*/
	vendorType = new Ext.form.ComboBox(
	{
	    store			: dsVendorType, 
	    displayField	: 'type_name',
		valueField		: 'id',
		editable		: false,
		forceSelection 	: true,
		allowBlank		: false,
		lazyRender		: true,
		mode			: 'local',
		fieldLabel		: 'Prefer Type',
	    triggerAction	: 'all',
	    emptyText		: 'Select a Vendor Type...',
	    selectOnFocus	: true
	});
	
    // create the Data Store
    dsData = new Ext.data.Store(
	{
        url: "/vendors/php/vendors_data.php",
    	method:'post',
        reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
                {name: 'id', type:'int'},
	    		{name: 'vendor_name', type:'string'},
				{name: 'vendor_prefer_type', type:'int'},
				{name: 'vendor_phone', type:'string'},
				{name: 'vendor_fax', type:'string'}
			]
        }),

        // turn on remote sorting
        remoteSort: true
    });
	
    dsData.setDefaultSort('vendor_name', 'asc');

	// the column model has information about grid columns
    // dataIndex maps the column to the specific data field in
    // the data store
    
    var cm = new Ext.grid.ColumnModel([
    	new Ext.grid.RowNumberer(),
		{
			id: 'name',
           header: "Name",
           dataIndex: 'vendor_name',
           editor: new Ext.form.TextField({allowBlank:false})
        },
		{
	        header		:	'Prefer Type',
	    	dataIndex	:	'vendor_prefer_type',
	    	sortable	:	true,
			editable	:	true,
			editor		:	vendorType,
			renderer: function(data) 
			{
				if (data != undefined )
				{
					var idx = dsVendorType.find(vendorType.valueField, data);
					
					var rec = dsVendorType.getAt(idx);
					
					if(rec != undefined)
						return rec.get(vendorType.displayField);
				}
			}
	    },
		{
			header		:	'Phone',
	    	dataIndex	:	'vendor_phone',
	    	sortable	:	true,
			editable	:	true,
			editor		:	new fm.TextField({allowBlank: false})
		},
		{
			header		:	'Fax',
	    	dataIndex	:	'vendor_fax',
	    	sortable	:	true,
			editable	:	true,
			editor		:	new fm.TextField({allowBlank: false})
		}
    ]);

    // by default columns are sortable
    cm.defaultSortable = true;

	var grid = new Ext.grid.EditorGridPanel(
	{
        region:'center',
		frame:true,
        title:'Vendors',
        store: dsData,
        cm: cm,
        trackMouseOver:true,
        selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),
        stripeRows: true,
		autoSizeColumns:true,
		autoSizeHeaders:true,
		//autoExpandColumn: 'name',
        loadMask: true,
        viewConfig: 
		{
            forceFit:false
        },       
        tbar:[
        {
			id			: 'add',
			icon: '/images/application/file-add.png',				
			cls: 'x-btn-text-icon',			
            text		: 'Add',
			handler		: function ()
			{	
				showDetail(null);
			}
        },
		{
			text	:	'Save Changes',
			icon	: 	'/images/application/save.png',				
			cls		: 	'x-btn-text-icon',
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
							url:"/vendors/php/process_vendors.php",
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
			icon: '/images/application/file-delete.png',				
			cls: 'x-btn-text-icon', 
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
									url:"/vendors/php/process_vendors.php",										
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
			handler	:	loadDataSource
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
	dsVendorType.on('load', loadDataSource);
	dsVendorType.load();
	
    dsData.load();
    
    function loadDataSource()	
    {	
    	dsData.load();
	}
});