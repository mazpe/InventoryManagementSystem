/**
 * @author Greivin
 */
var dsData = null;
var topAnchor = '95%';
var name = null;
var pieceWorkType = null;
var hours = null;
var totalCost = null;
var currentRow = null;
var formPanel = null;
var dialog = null;
var employeeGrid = null;
var field = null;
var order = null;

function formatDate(value)
{
    return value ? value.dateFormat('M d, Y') : '';
}

/**
 * Overrides NumberField to allow a correct decimalPrecision
 * @param {Number} v
 */
Ext.override(Ext.form.NumberField, 
{
    setValue : function(v){
    	v = parseFloat(v);
    	v = isNaN(v) ? '' : (v.toFixed(this.decimalPrecision)).replace(".", this.decimalSeparator);
        Ext.form.NumberField.superclass.setValue.call(this, v);
    }
});

/**
 * Overrides usMoney to render the values with .000 
 * @param {Number} v
 */
Ext.util.Format.usMoney = function(v)
{ 
	// override Ext.util.usMoney
    //v = Ext.num(v, 0); // ensure v is a valid numeric value, otherwise use 0 as a base (fixes $NaN.00 appearing in summaryRow when no records exist)
    v = (Math.round((v - 0) * 1000)) / 1000;
	v = (v == Math.floor(v)) ? v + ".00" : ((v * 10 == Math.floor(v * 10)) ? v + "0" : v);
    v = String(v);
	
    var ps = v.split('.');
    var whole = ps[0];
	var length = ps[1].length;
	
    var sub = ps[1] ? '.' + (length == 1 ? ps[1] + '00' : (length == 2 ? ps[1] + '0' : ps[1])) : '.000';
    var r = /(\d+)(\d{3})/;
	
    while (r.test(whole)) 
	{
        whole = whole.replace(r, '$1' + ',' + '$2');
    }
	
    v = whole + sub;
    if (v.charAt(0) == '-') {
        return '-$' + v.substr(1);
    }
    return "$" + v;
}

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

	//Jobs type
    var dsJobType = new Ext.data.Store(
	{
		proxy: new Ext.data.HttpProxy({url:'/plants/php/jobs_data.php', method:'post'}),
        reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
                {name:'id', type:'int'}, 
				{name:'name', type:'string'},
				{name:'type', type:'int'},
				{name:'ref', type:'string'}
			]
        })	    
	});

	dsJobType.on('load', function()
	{
		dsJobType.add(new Ext.data.Record(
		{
			id: 0,
			name: 'All'
		}));	
	});
	
	//create the Data Store
    var dsMaterial = new Ext.data.Store(
	{
		proxy: new Ext.data.HttpProxy({url:'/plants/php/materials_data.php', method:'post'}),
    	reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
                {name:'id', type:'int'}, 
				{name:'name', type:'string'}
				
			]
        })
    });
	
	dsMaterial.on('load', function()
	{
		dsMaterial.add(new Ext.data.Record(
		{
			id: 0,
			name: 'All'
		}));	
	});
		
	//Employees
    var dsEmployee = new Ext.data.Store(
	{
		proxy: new Ext.data.HttpProxy({url:'../employees/php/employees_data.php', method:'post'}),
        reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
                {name:'id', type:'int'}, 
				{name:'full_name', type:'string'},
				{name:'salary', type:'float'},
				{name:'cost', type:'float'}
			]
        })	    
	});
	
	//Blocks
    var dsBlock = new Ext.data.Store(
	{
		//proxy: new Ext.data.HttpProxy({url:'../blocks/php/blocks_data.php', method:'post'}),
		url: '../blocks/php/blocks_data.php',
    	method:'post',
        reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
                {name:'id', type:'int'}, 
				{name:'name', type:'int'}
			]
        })    
	});
	
	dsBlock.on('load', function()
	{
		dsBlock.add(new Ext.data.Record(
		{
			id: 0,
			name: 'All'
		}));	
		
		dsMaterial.load();
	});
	
	//Plants
    var dsPlant = new Ext.data.Store(
	{
		url: 'php/plants_data.php',
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
	
	dsPlant.on('load', function()
	{
		dsPlant.add(new Ext.data.Record(
		{
			id: 0,
			plant: 'All'
		}));	
	});
	
	//create the Data Store
    var dsData = new Ext.data.Store(
	{
		//TODO 		
		proxy: new Ext.data.HttpProxy({url:'php/plant_ticket.php?ticket=' + ticketId, method:'post'}),
		reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
   				{name: 'id', type: 'int'},
    			{name: 'inventory_id', type: 'int'},
    			{name: 'job_id', type: 'int'},
    			{name: 'job_name', type:'string'},
				{name: 'plant', type:'string'},
				{name: 'block', type:'int'},
    			{name: 'ref'},
    			{name: 'id_material'},
    			{name: 'material_name'} ,
    			{name: 'material_cost', type: 'float'},
    			{name: 'labor_id'},
    			{name: 'labor_name'},
    			{name: 'labor_cost', type: 'float'},
				{name: 'qty', type: 'int'},
				{name: 'employee_id'},				
				{name: 'employee'},
				{name: 'status'},
    			{name: 'date', type: 'date', dateFormat: 'Y-m-d'} 
			]
        }),
		sortInfo	:	{field	:	'date', direction	:	'ASC'}
		
    });

    //Job type
    var jobType = new Ext.form.ComboBox(
    {
        store: dsJobType,
        valueField:'id',
        displayField:'name',
		width:100,
        typeAhead: true,
		editable:false,
        triggerAction: 'all'
    });

	jobType.on('select', function()
	{
		loadMaterialsByJob(jobType.getValue());
		
		loadDataSource();
	});

    //Material
    var material = new Ext.form.ComboBox(
    {
        store: dsMaterial,
        valueField:'id',
        displayField:'name',
		width: 70,
        typeAhead: true,
		editable:false,
        triggerAction: 'all'
    });

	material.on('select', loadDataSource);
		
	var block = new Ext.form.ComboBox(
    {
        fieldLabel: 'Blocks',                        
        store: dsBlock,
        valueField:'id',
        displayField:'name',
		width: 55,
        typeAhead: true,
		editable:false,
        triggerAction: 'all'
    });
	
	block.on('select', loadDataSource);

	var status = new Ext.form.ComboBox(
	{
        store: new Ext.data.SimpleStore(
		{
    		fields: ['status', 'status'],
			data : [['All','1'], ['Pending','4'], ['Open','3'], ['Closed','2']]
		}),
        valueField:'status',
        displayField:'status',
        typeAhead: true,
		width: 100,
		editable:false,
        mode: 'local',
        triggerAction: 'all'
    });
	
	status.on('select', loadDataSource);
		
	var plant = new Ext.form.ComboBox(
    {
        fieldLabel: 'Plant',                        
        store: dsPlant,
        valueField:'id',
        displayField:'plant',
		width:100,
        typeAhead: true,
		editable:false,
        triggerAction: 'all'
    });
	
	plant.on('select', function()
	{
		plantId.setValue(plant.getValue());		
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
		
	var employee = new Ext.form.ComboBox(
    {
        fieldLabel: 'Employee',                        
        store: dsEmployee,
        valueField:'id',
        displayField:'full_name',
		width:100,
		mode:'local',
        typeAhead: true,
		editable:false,
        triggerAction: 'all'
    });
	
	var startDateField = new Ext.form.DateField(
	{
		format: 'm/d/y',
		disabled: true
	});
	
	startDateField.on('change', loadByDateRange);
		
	var endDateField = new Ext.form.DateField(
	{
		format: 'm/d/y',
		disabled: true
	});
	
	endDateField.on('change', loadByDateRange);
	
	var plantId = new Ext.form.ComboBox(
    {
        store: dsPlant,
        valueField:'id',
        displayField:'id',
		width:55,
		typeAhead: true,
		editable:false,
        triggerAction: 'all'
    });
	
	plantId.on('select', function()
	{
		plant.setValue(plantId.getValue());
		loadDataSource();	
	});
	
    var pendingJobColumnModel = new Ext.grid.ColumnModel([
	{
		header		:	'Schedule Date',
		dataIndex	:	'date',
		width: 100,
		renderer	:	Ext.util.Format.dateRenderer('m/d/y'),
		sortable	:	true 
	},
	{
		header		:	'Job Name ',
		dataIndex	:	'job_name',
		width:100,
		sortable	:	true
	},
	{
		header		:	'Material',
		dataIndex	:	'material_name',
		width:70,
		sortable	:	true
	},
	{
		header		:	'Block', 
		dataIndex	:	'block',
		align: 'right',
		width: 55,
		sortable	:	true
	},
	{
		header		:	'Qty',
		dataIndex	:	'qty',
		width:55,
		align: 'right',		
		sortable	:	true
	},
	{
		header		:	'Plant Id', 
		dataIndex	:	'inventory_id',
		width:55,
		align: 'right',
		sortable	:	true		
	},
	{
		header		:	'Plant',
		dataIndex	:	'plant',
		width:100,
		sortable	:	true
	},
	{
		header		:	'Status', 
		dataIndex	:	'status',
		sortable	:	true,
		width: 100,
		editor		:	new Ext.form.ComboBox(
		{
                    store: new Ext.data.SimpleStore(
					{
	            		fields: ['status', 'status'],
            			data : [['Pending','2'],['Open','3'],['Closed','4']]
        			}),
                    valueField:'status',
                    displayField:'status',
                    typeAhead: true,
					editable:false,
                    mode: 'local',
                    triggerAction: 'all'
    	})
	},
	{
		header		:	'Assign To', 
		dataIndex	:	'employee_id',
		width: 100,		
		editor		:	employee,
		sortable	:	true,
		hidden: true,
		renderer: function(data) 
		{
			var record = dsEmployee.getById(data);
			
			if (record != undefined )
				return record.data.full_name;
		
			return 'Select one';					
		}		
	}]);

	var pendingJobGrouping = new Ext.grid.GroupSummary();	
	//var pendingJobSummary = new Ext.ux.grid.GridSummary();

	var ticketClosed = ticketStatus != 'Open';
		
	//Pending jobs
	var grid = new Ext.grid.EditorGridPanel( 
	{
		region:'center',
		store :dsData,
		cm:pendingJobColumnModel,
		stripeRows :true,
		selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),
		frame:true,
		loadMask:true,
		clicksToEdit:1,
		viewConfig: 
		{
            forceFit:false
        },			
		title :'Ticket ' + ticketId,
		buttonAlign:'center',
		buttons:[
		{
            text: 'Save',
			icon: '/images/application/save.png',
			cls: 'x-btn-text-icon',
			disabled:(ticketStatus != 'Open'),
			handler	: saveTicket
        },
		{
			text	: (ticketClosed ? 'Re-open Ticket' : 'Close Ticket'),
			icon: '/reports/images/ticket_close.png',
			cls: 'x-btn-text-icon', 
			handler	:	function()
			{
					Ext.MessageBox.confirm('Confirm', 'Do you want to continue?', function(value)
					{
							if (value == 'yes') 
							{
								var jsonData = '';
								
								jsonData += '{"' + (ticketClosed ? "open" : "close")  + '":true, "id":"' + ticketId + '"}';
								
								jsonData = "[" + jsonData + "]";
								
								gridForm.submit(
								{
									waitMsg: (ticketClosed ? 'Opening' : 'Closing') + ' ticket, please wait...',
									url: "/ticket/php/process_ticket.php",
									params: 
									{
										data: jsonData
									},
									success: function(form, action)
									{
										if(!ticketClosed)
											appyLaborCost();
										else							
											document.location.reload();
									},
									failure: function(form, action)
									{
										alert(action.result.message);
									}
								});
							}											
					});		
			}
		},
		{
			text: 'Remove Job',
			icon: '/reports/images/ticket_edit.png',
			cls: 'x-btn-text-icon',
			disabled: (ticketStatus != 'Open'),
			handler: function()
			{
				jsonData = "";
				
				var rows = grid.getSelectionModel().getSelections();
				
				for (i = 0; i < rows.length; i++) 
				{
					rows[i].data.ticket = 0;
					
					jsonData += Ext.util.JSON.encode(rows[i].data) + ",";
				}
				
				if (jsonData.length > 0) 
				{
					jsonData = "[" + jsonData.substring(0, jsonData.length - 1) + "]";
					
					gridForm.submit(
					{
						waitMsg: 'Saving changes, please wait...',
						url: "php/remove_ticket.php",
						params: 
						{
							data: jsonData
						},
						success: function(form, action)
						{
							alert('Your changes were saved!');
							
							loadDataSource();
						},
						failure: function(form, action)
						{
							alert('Error processing the action.');
						}
					});
				}
				else 
					alert('No changes to submit.');
			}
		}],
		tbar: 
		new Ext.Panel({
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
						'From:&nbsp;&nbsp;&nbsp;&nbsp;',
						startDateField,
						'To:&nbsp;',
						endDateField,
						'-',
						{
							text	:	'Load',
							icon: '/images/application/refresh.png',
							cls: 'x-btn-text-icon',
							handler	:	function()
							{
								loadDataSource();
							}
						},'-',
						{
				            text: 'Apply Labor Cost',
							icon: '/reports/images/apply_labor_cost.png',
							cls: 'x-btn-text-icon',
							disabled: (ticketStatus == 'Open'),
							handler	: appyLaborCost				        
						},'-',
						{
							text	:	'Print',
							icon	: '/images/application/print.png',
							cls		: 'x-btn-text-icon',
							handler	:	function()
							{	
								if(startDateField.disabled == true && endDateField.disabled == true)
									url = "/reports/print/jobs-ticket.php?ticket=" + ticketId + "&sort=" + field + "&dir=" + order + "&block=" + block.getValue() + "&plant_id=" + plantId.getValue() + "&plant=" + plant.getRawValue() + "&date_range=" + date.getValue() + "&status=" + status.getValue() + "&job_id=" + jobType.getValue(); 
								else
									url = "/reports/print/jobs-ticket.php?ticket=" + ticketId  + "&sort=" + field + "&dir=" + order + "&block=" + block.getValue() + "&plant_id=" + plantId.getValue() + "&plant=" + plant.getRawValue() + "&start=" + getFormattedDate(startDateField.getValue()) + "&end=" + getFormattedDate(endDateField.getValue()) + "&status=" + status.getValue() + "&job_id=" + jobType.getValue();
									 
								popUp(url);
							}
						},'-'
					]
				},
				{
					xtype: 'toolbar',
					items: [
						date,
						jobType,
						material,
						block,
						'&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp',
						plantId,
						plant,
						status
					]
				}]
			})
	});


	grid.on('sortchange', function(grid, sortInfo) 
	{
        field = sortInfo.field;
		order = sortInfo.direction;
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

	dsEmployee.on('load', loadDataSource);
	dsEmployee.load();
	
	function loadDataSource()	
    {	
		if(startDateField.disabled == false)
		
		dsData.load(
		{
			params:
			{
				date_range:date.getValue(),
				job_id:jobType.getValue(),
				block_id:block.getValue(),
				plant_id:plant.getValue(),
				material_id: material.getValue(),
				start:getFormattedDate(startDateField.getValue()),
				end:getFormattedDate(endDateField.getValue()),
				status:status.getValue()
			}
		});
		else
	    	dsData.load(
			{
				params:
				{
					date_range:date.getValue(),
					job_id:jobType.getValue(),
					block_id:block.getValue(),
					plant_id:plant.getValue(),
					material_id: material.getValue(),
					status:status.getValue()
				}
			});
	}
	
	
	function loadByDateRange()
	{
		if(startDateField.getValue() != '' && endDateField.getValue() != '')
			loadDataSource();	
	}
	
	/**
	 * Load the materials corresponding to the job id.	  
	 * @param {int} value
	 */
	function loadMaterialsByJob(value)
	{
		var record = dsJobType.getById(value);
		
		if (record != undefined) 
		{
			var ref = record.get("ref");
			var jobType = record.get('type');
			
			dsMaterial.load(
			{
				params: 
				{
					job_type: jobType,
					ref: ref
				}
			});
		}
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

	function createDialog()
	{
		var sm2 = new Ext.grid.CheckboxSelectionModel();
		
		sm2.on('selectionchange', calculateCost);
		sm2.on('rowdeselect', function(sm, rowIndex, record)
		{
			record.set('cost', 0);
		});
		
	    var cm = new Ext.grid.ColumnModel([
		sm2,
		{
			header		:	'Name',
			dataIndex	:	'full_name',
			width: 150,
			sortable	:	true 
		},
		{
			header		:	'Cost',
			dataIndex	:	'cost',			
			width: 150,
			sortable	:	true,
			renderer: 'usMoney'
		}
		]);

		//Pending jobs
		employeeGrid = new Ext.grid.EditorGridPanel(
		{
			region: 'center',
			store: dsEmployee,
			cm: cm,
			stripeRows: true,
			sm:sm2,
			frame: true,
			loadMask: true,
			clicksToEdit: 1,
			height:200,
			viewConfig: 
			{
				forceFit: false
			}
		});			

		grid.on('cellclick', calculateCost);
		
		formPanel = new Ext.form.FormPanel(
		{				
		    bodyStyle:'padding:0px',		
			method:'post',
			url: "php/file.php",		
		    items: [
			{
		        layout:'column',
		        border:false,
				labelAlign:'right',
				bodyStyle:'padding:5px',			
		        items:[
		        {
		            columnWidth:1,
		            layout: 'form',
		            border:false,				
		            items: [
		            pieceWorkType = new Ext.form.ComboBox(
					{
	                    store: new Ext.data.SimpleStore(
						{
		            		fields: ['type', 'id'],
	            			data : [['Piece Work',0],['Hours',1]]
	        			}),
						fieldLabel:'Type',
	                    valueField:'id',
	                    displayField:'type',					
	                    typeAhead: true,
						editable:false,
	                    mode: 'local',
                    	triggerAction: 'all'
    				}),
			        
			        hours = new Ext.form.NumberField(
			        {
			            fieldLabel: 'Hours',
						disabled:true,								            
			            name: 'hours',
						listeners:{'change': calculateCost},
			            value: ''
			        }),
					totalCost = new Ext.form.NumberField(
			        {
			            fieldLabel: 'Total Labor Cost',
						disabled:true,								            
			            name: 'cost',
						decimalPrecision: 3,
			            value: ''
			        }),
					employeeGrid
			        ]
		        }]
		    }]
		});
	
		pieceWorkType.on('select', function()
		{	
			hours.setDisabled(pieceWorkType.getValue() == 0)
			
			setTotalCost();					
		});
		
		formPanel.on("actioncomplete", function(t, a) 
		{			
			alert('Your changes were saved!');
			
			formPanel.getForm().reset();
		});
	
		dialog = new Ext.Window({
		    title: 'Apply labor cost',
		    width: 500,
		    height:350,
			layout: 'fit',
		    plain:true,
			closeAction :'hide',
			modal:true,
		    bodyStyle:'padding:5px;',
		    buttonAlign:'center',
		    items: formPanel,
		    buttons: [
			{
	            text: 'Save',
				handler	:	function()
				{
		        	jsonData = "";
					
					var rows = employeeGrid.getSelectionModel().getSelections();
					
					for(i = 0; i < rows.length; i++) 
					{
						rows[i].data.ticket = ticketId;
						rows[i].data.insert = true;
						jsonData += Ext.util.JSON.encode(rows[i].data) + ",";
					}
					
					if(jsonData.length > 0)
					{
						jsonData = "[" + jsonData.substring(0,jsonData.length-1) + "]";
						
						gridForm.submit(
						{
							waitMsg: 'Saving changes, please wait...',
							url:"/ticket/php/process_ticket_work.php",
							params:{data:jsonData, piece_work:pieceWorkType.getValue(), labor_cost: getCostPerPlant()},
							success:function(form, action) 
							{
								if(pieceWorkType.getValue() == 1)
								{
									var costPerPlant = getCostPerPlant();
									
									for(var i = 0; i < dsData.getCount(); i++)
										dsData.getAt(i).set('labor_cost', costPerPlant);
									
									//saveTicket();
								}
								
								dialog.hide();
								
								document.location.reload();								
							},
							failure: function(form, action) 
							{
								alert('Error processing the action.');
							}
						});
					}				
					else
						alert('No changes to submit.');		
				}
	        },
			{
		        text: 'Close',
				handler  : function()
				{
		        	dialog.hide();
		        }
		    }]
		});
	}
	
	function setValues()
	{
		var record = new Ext.data.Record(
		{
			id         : 0, 
			name       : name.getValue(), 
			vendor_id  : vendor_id.getValue(),
			days 	   : days.getValue(),
			cost       : cost.getValue(),
			insert:true
		});
		
		dsData.add(record);
			
		dialog.hide();			
		formPanel.getForm().reset();
	}

	function getCostPerPlant()
	{
		var qty = 0, totalCostValue = totalCost.getValue();
			
		for (var i = 0; i < dsData.getCount(); i++) 
			qty += parseFloat(dsData.getAt(i).data.qty);
		
		return (qty > 0)? (totalCostValue / qty) : 0;				
	}	
	
	function calculateCost(selectionModel)
	{
		setTotalCost();
		
		var record = null;
		var count = 0;
		var cost = 0;		
		var totalCostValue = totalCost.getValue();
		var rows = employeeGrid.getSelectionModel().getSelections();
		var qty = 0;
		var costPerPlant = 0;
		
		if (pieceWorkType.getValue() == 0) 
		{
			cost = (rows.length > 0 ? (totalCostValue / rows.length) : 0);
			
			for (var i = 0; i < rows.length; i++) 
				rows[i].set('cost', cost);
		}
		else 
		{
			hoursValue = hours.getValue();
			
			if(hoursValue == "")
				hoursValue = 0;
				
			for (var i = 0; i < dsData.getCount(); i++) 
				qty += parseFloat(dsData.getAt(i).data.qty);
			
			costPerPlant = (qty > 0)? (totalCostValue/qty) : 0;
			
			for (var i = 0; i < rows.length; i++) 
				rows[i].set('cost', rows[i].get('salary') * hoursValue);
			
			//cost = (hoursValue > 0 ? (totalCostValue / hoursValue) : 0);
		}							
	}
	
	function setTotalCost()
	{
		var total = 0;
		
		if (pieceWorkType.getValue() == 0) 
			for (var i = 0; i < dsData.getCount(); i++) 
				total += parseFloat(dsData.getAt(i).data.labor_cost) * parseFloat(dsData.getAt(i).data.qty);
		else 
		{
			var rows = employeeGrid.getSelectionModel().getSelections();
			
			for (var i = 0; i < rows.length; i++)
				total += parseFloat(rows[i].data.salary);
			
			if(hours.getValue() != "")
				total = total * parseFloat(hours.getValue());
			else
				total = 0;
		}
			
		totalCost.setValue(total); 
	}
	
	function appyLaborCost()
	{
		if(formPanel == null)
			createDialog();	
	
		setTotalCost();
		
		pieceWorkType.setValue(0);
		
		dialog.show();
	}
	
	function saveTicket()
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
					url:"php/process_plant.php",
					params:{data:jsonData},
					success:function(form, action) 
					{
						alert('Your changes were saved!');
						
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

	function popUp(url) 
	{
		day = new Date();
		id = day.getTime();
		
		eval("page" + id + " = window.open('" + url + "', '" + id + "', 'toolbar=0, location=0, scrollbars=1 lbar=no, statusbar=0, addressbar=0, directories=no, menubar=yes, status=no, resizable=0, width=900,height=500,left = 390,top = 150');");
	}
});