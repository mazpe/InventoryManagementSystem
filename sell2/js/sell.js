/**
 * @author Greivin
 */
var dsData = null;

Ext.onReady(function() 
{
	function formatDate(value)
	{
        return value ? value.dateFormat('m/d/y') : '';
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
	
	//This datasources is used for add a sale
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
    	url: "/sell2/php/sell_data.php",
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
	
    dsData.setDefaultSort('order_no', 'desc');
	
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

	//Grid2
	//Used for filteriing data by plant name
    var dsPlant1 = new Ext.data.Store(
	{
		url: '/reports/php/plants_data.php',
    	method:'post',
        reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'plant',
            fields: [
                {name:'id', type:'int'}, 
				{name:'plant', type:'string'}
			]
        })	    
	});
	
	dsPlant1.on('load', function()
	{
		dsPlant1.add(new Ext.data.Record(
		{
			id: 0,
			plant: 'All'
		}));	
		
		dsPlant1.sort("plant", "ASC");
	});
	
	//Plants
    var dsPlant2 = new Ext.data.Store(
	{
		url: '/reports/php/plants_data.php',
    	method:'post',
        reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
                {name:'id', type:'int'}, 
				{name:'plant', type:'string'}
			]
        })	    
	});
	
	dsPlant2.on('load', function()
	{
		dsPlant2.add(new Ext.data.Record(
		{
			id: 0,
			plant: '0'
		}));	
		
		dsPlant2.sort("id", "ASC");
	});

	//Plants
    var dsOrder = new Ext.data.Store(
	{
		url: 'php/sell_order_data.php',
    	method:'post',
        reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
                {name:'id', type:'int'}
			]
        })	    
	});
	
	dsOrder.on('load', function()
	{
		dsOrder.add(new Ext.data.Record(
		{
			id: 'All'
		}));	
		
		dsOrder.sort("id", "DESC");
	});
	
	var orderNo = new Ext.form.ComboBox(
    {
        store: dsOrder,
        valueField:'id',
        displayField:'id',
		width:92,
		typeAhead: true,
		editable:false,
        triggerAction: 'all'
    });
	
	orderNo.on('select', loadDataSource);
	
	var plant1 = new Ext.form.ComboBox(
    {
        fieldLabel: 'Plant',                        
        store: dsPlant1,
        valueField:'id',
        displayField:'plant',
		width:100,
        typeAhead: true,
		editable:false,
        triggerAction: 'all'
    });

	plant1.on('select', function()
	{
		loadDataSource();	
	});
	
	var plantId1 = new Ext.form.ComboBox(
    {
        store: dsPlant2,
        valueField:'id',
        displayField:'id',
		width:70,
		typeAhead: true,
		editable:false,
        triggerAction: 'all'
    });
	
	plantId1.on('select', function()
	{
		loadDataSource();	
	});

	var date = new Ext.form.ComboBox(
	{
        store: new Ext.data.SimpleStore(
		{
    		fields: ['date', 'date_id'],
			data : [['All','1'],['This Week','2'],['This Year','3'],['Month to Date','4'],['Year to Date','5']]
		}),
        valueField:'date',
        displayField:'date',
        typeAhead: true,
		editable:false,
        mode: 'local',
		width:100,
        triggerAction: 'all'
    });
	
	date.on('select', loadDataSource);

	var startDateField = new Ext.form.DateField(
	{
		format: 'm/d/y',
		disabled: true,
		width:70
	});
	
	startDateField.on('change', loadByDateRange);
		
	var endDateField = new Ext.form.DateField(
	{
		format: 'm/d/y',
		width:80,
		disabled:true
	});
	
	endDateField.on('change', loadByDateRange);

	var cmAux = new Ext.grid.ColumnModel([
    	new Ext.grid.RowNumberer(),
		{
		   header: "Qty",
           dataIndex: 'sell_qty',
		   align:'right',
		   width:55,
	        editor: new fm.NumberField(
			{
				allowBlank: true
			}),
			summaryType	:	'sum'
        },
		{
           header: "Plant Id",
           dataIndex: 'plant_id',
		   width:55,
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
           dataIndex: 'order_no',
		   width:70
        },
		{
			header:'Plant Id',			
			dataIndex: 'plant_id',
			width:70
		},
		{
			header:'Plant Name',			
			dataIndex: 'plant',
			width:100
		},
		{
			header:'Qty',			
			dataIndex: 'qty',
			align:'right',
			summaryType	:	'sum',
			width:55
		},
		{
		   header: "Date",
           dataIndex: 'date',
		   renderer: formatDate,
		   align:'center',
		   width:100
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
		region:'west',
		//height:100,
		collapsible: true,
        split:true,
        width: 350,
        minSize: 300,
        maxSize: 450,
        layout:'fit',
        margins:'0 5 0 0',
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
		{
			text	:	'Refresh', 
			icon	: '/images/application/refresh.png',				
			cls		: 'x-btn-text-icon',			
			handler	:addRows
		}]
    });

	var summary = new Ext.ux.grid.GridSummary();
	
	var grid = new Ext.grid.GridPanel(
	{
        frame:true,
        title:'Sales',
        store: dsData,
        cm: cm,
		region:'center',
		//deferredRender:false,
		split:true,
        trackMouseOver:true,
        selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),
       	stripeRows: true,
		//height:350,
		clicksToEdit:1,
		plugins:summary,
		autoSizeColumns:true,
		autoSizeHeaders:true,
		loadMask: true,
        viewConfig: 
		{
            forceFit:false
        },       
        tbar:new Ext.Panel(
		{
				items:[
				{
					xtype: 'toolbar',
					items: [
						{
							text: 'By Range',
				        	enableToggle: true,
							tooltip:'Toogle this button to activate or inactivate date range.',
        					toggleHandler: onRangeToogle        					
						},
						'From:',
						startDateField,
						'To:',
						endDateField,
						'-',
						{
							text	:	'Load',
							icon: '/images/application/refresh.png',
							cls: 'x-btn-text-icon',
							handler	:loadDataSource							
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
													url:"php/process_sell.php",										
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
						}	
					]
				},
				{
					xtype: 'toolbar',
					items: [
						orderNo,	
						plantId1,
						plant1,
						'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
						date
						]
				}]
		})
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
		
		for(var i = 0; i < 30; i++)
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
		if(startDateField.disabled == false)
			dsData.load(
			{
				params:
				{
					date_range:date.getValue(),
					order_no:orderNo.getValue(),					
					plant_id:plantId1.getValue(),
					plant:plant1.getRawValue(),					
					start:getFormattedDate(startDateField.getValue()),
					end:getFormattedDate(endDateField.getValue())
				}
			});
		else		
	    	dsData.load(
			{
				params:
				{
					date_range:date.getValue(),
					order_no:orderNo.getValue(),
					plant_id:plantId1.getValue(),
					plant:plant1.getRawValue()
				}
			});
	}
	
	function loadByDateRange()
	{
		if(startDateField.getValue() != '' && endDateField.getValue() != '')
			loadDataSource();	
	}
	
	function onRangeToogle(item, pressed)
	{
        startDateField.setDisabled(!pressed);
		endDateField.setDisabled(!pressed);
    }
	
	function getFormattedDate(date)
	{
		var day = date.getDate();
		var month = (date.getMonth() + 1);
		
		return date.getFullYear() + '-' + (month > 9 ? month : '0' + month) + '-' + (day > 9 ? day : '0' + day);
	}
});