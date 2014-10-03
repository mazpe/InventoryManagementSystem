/**
 * @author Greivin
 */
var dsData = null;

Ext.onReady(function() 
{
	function formatDate(value)
	{
        return value ? value.dateFormat('M d, Y') : '';
    };

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
	
	//Plants
    var dsPlant = new Ext.data.Store(
	{
		url: '/plants/php/plants_data.php',
    	method:'post',
        reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
                {name:'id', type:'int'},				
				{name:'qty', type:'int'},
				{name:'plant_name', type:'string'}
			]
        })	    
	});

	dsPlant.on('load', function()
	{
		dsPlant.sort('id', 'ASC');	
	});
	
	dsPlant.load();
	
    //create the Data Store
 	dsAuxData = new Ext.data.Store(
	{
        // load using script tags for cross domain, if the data in on the same domain as
        // this page, an HttpProxy would be better
    	url: "/sell/php/sell_data.php",
    	method:'post',
        reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
				{name:'id', type:'int'},
                {name:'plant_id', type:'int'},				 
				{name:'plant', type:'string'},
				{name:'qty', type:'int'},
				{name:'sell_qty', type:'int'}
			]
        })
    });
	
    //create the Data Store
 	dsData = new Ext.data.Store(
	{
        // load using script tags for cross domain, if the data in on the same domain as
        // this page, an HttpProxy would be better
    	url: "/sell/php/sell_data.php",
    	method:'post',
        reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
				{name:'id', type:'int'},
				{name:'order_no', type:'int'},
				{name:'date', type:'date', dateFormat: 'Y-m-d'},
                {name:'plant_id', type:'int'},
				{name:'plant', type:'string'},
				{name:'qty', type:'int'}
			]
        })
    });
	
    dsData.setDefaultSort('order_no', 'asc');

	plantId = new Ext.form.ComboBox(
    {
        store: dsPlant,
        valueField:'id',
        displayField:'id',
		selectOnFocus:true,
		foceSeletion:true,				
        typeAhead: true,
		editable:true,
		mode:'local',
        triggerAction: 'all'        		
    });	
	
	plantId.on('select', function()
	{
		var record = dsPlant.getById(plantId.getValue());
		
		var rows = gridAux.getSelectionModel().getSelections();
		
		if(record != null)
		{
			rows[0].set('qty', record.get('qty'));
		}	rows[0].set('plant', record.get('plant_name'));
			
	});

	var cmAux = new Ext.grid.ColumnModel([
    	new Ext.grid.RowNumberer(),
		{
		   header: "Qty",
           dataIndex: 'sell_qty',
		   align:'right',
	        editor: new fm.NumberField(
			{
				allowBlank: true
			}),
			summaryType	:	'sum'
        },
		{
           header: "Plant Id",
           dataIndex: 'plant_id',
		   editor:plantId
        },
		{
		   header: "Plant Name",
           dataIndex: 'plant'
        },
		{
			header:'Available',			
			dataIndex: 'qty',
			summaryType	:	'sum'	
		}
    ]);

    // by default columns are sortable
    cmAux.defaultSortable = true;
	
    var cm = new Ext.grid.ColumnModel([
    	new Ext.grid.RowNumberer(),
		{
           header: "Order No",
           dataIndex: 'order_no'
        },
		{
			header:'Plant Id',			
			dataIndex: 'plant_id'
		},
		{
			header:'Plant Name',			
			dataIndex: 'plant'
		},
		{
			header:'Qty',			
			dataIndex: 'qty',
			align:'right',
			summaryType	:	'sum'
		},
		{
		   header: "Date",
           dataIndex: 'date',
		   renderer: formatDate
        }
    ]);

    // by default columns are sortable
    cm.defaultSortable = true;

	var summaryAux = new Ext.ux.grid.GridSummary();
	
	var gridAux = new Ext.grid.EditorGridPanel(
	{
        frame:true,
        title:'Sell',
        store: dsAuxData,
        cm: cmAux,
		region:'center',
		height:200,
		trackMouseOver:true,
        selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),
       	stripeRows: true,
		clicksToEdit:1,
		plugins:summaryAux,
		autoSizeColumns:true,
		autoSizeHeaders:true,
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
			handler		: addRow
        },
		{
			text	:	'Save',
			icon	: '/images/application/save.png',				
			cls		: 'x-btn-text-icon',
			handler	:	function()
			{
				gridAux.stopEditing(false);
				
	        	jsonData = "";
				
				for(i = 0; i < dsAuxData.getCount(); i++) 
				{
					record = dsAuxData.getAt(i);
					
					if(record.data.plant_id != '' && record.data.plant_id != 0 && record.data.available != 0 && record.data.available != '')
					{
						if(record.data.sell_qty <= record.data.qty)
							jsonData += Ext.util.JSON.encode(record.data) + ",";
						else
							alert('Please correct the qty at line ' + (i + 1) + '.');
					} 
				}
				
				if(jsonData.length > 0)
				{
					jsonData = "[" + jsonData.substring(0,jsonData.length-1) + "]";
					
					gridForm.submit(
						{
							waitMsg: 'Saving changes, please wait...',
							url:"/sell/php/process_sell.php",
							params:{data:jsonData},
							success:function(form, action) 
							{
								dsPlant.load();				
								addRows();
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
		/*{
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
		},*/
		{
			text	:	'Refresh', 
			icon	: '/images/application/refresh.png',				
			cls		: 'x-btn-text-icon',			
			handler	:addRows
		}]
    });

	var summary = new Ext.ux.grid.GridSummary();
	
	var grid = new Ext.grid.EditorGridPanel(
	{
        frame:true,
        title:'Sales',
        store: dsData,
        cm: cm,
		region:'south',
		split:true,
        trackMouseOver:true,
        selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),
       	stripeRows: true,
		height:300,
		clicksToEdit:1,
		plugins:summary,
		autoSizeColumns:true,
		autoSizeHeaders:true,
		loadMask: true,
        viewConfig: 
		{
            forceFit:false
        },       
        tbar:[
        /*{
			id			: 'add-blocks',
			icon		: '/images/application/file-add.png',				
			cls			: 'x-btn-text-icon',
            text		: 'Add',
			handler		: function ()
			{								
				showDetail(null);
			}
        },*/
		/*{
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
		},*/
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
		gridAux,
		grid
		]
	});

	setup();
	
	function setup()
	{
		dsData.load();
		
		addRows();
		
		gridAux.on('beforeedit', function(e)
		{
			gridAux.getSelectionModel().selectRow(e.row, false);
		});
	}
    
	function addRows()	
	{
		dsAuxData.removeAll();
		
		for(var i = 0; i < 10; i++)
			addRow();
	}
	
	function addRow()	
	{
		dsAuxData.add(new Ext.data.Record(
		{
			id:dsAuxData.getCount(),
			sell_qty:'',
			plant_id:'',
			plant:'',				 
			qty:'0',
			insert:true
		}));
	}
	
    function loadDataSource()	
    {	
    	dsData.load();
	}
});