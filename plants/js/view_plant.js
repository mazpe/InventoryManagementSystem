/**
 * @author Greivin
 */
/**
 * Datasources
 */
var dsJob;
var dsPendingJob;
var dsAuxJob;
var dsJobType;
var dsTemplate;
var dsMaterial;
var dsLabor;
var dsSize;
var dsBlock;
var dsJobLabor;

/**
 * Editors
 */
var jobType;
var material;
var date;
var plantName;
var labor;
var block;
var price;
var size;
var days;
var qty;
var jobDate;

/**Price editors**/
var sell;
var margin;
var cost;
var profit;
var actualSell;
var actualMargin;
var actualCost;
var actualProfit;
var finalSell;
var finalMargin;
var finalCost;
var finalProfit;

var jobTypePending;
var materialPending;
var laborPending;

var grid;
var gridPendingJobs;

var jobDialog;
var completedJob = false;
var auxJobGrid;

var generalForm;

var plantId;
var plantNameValue;

/**
 * Overrides NumberField to allow a correct decimalPrecision
 * @param {Number} v
 */
Ext.override(Ext.form.NumberField, {
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

function formatDate(value)
{
    return value ? value.dateFormat('m/d/y') : '';
}

function laborCost(v, params, data) 
{
	return Ext.util.Format.usMoney(v);
}

function materialCost(v, params, data) 
{
	return Ext.util.Format.usMoney(v);
}
	
/*Object.prototype.clone = function() {
  return eval(uneval(this));
}*/

Ext.onReady( function() 
{
	plantId 	= Ext.get('plant-id').getValue();
	plantNameValue 	= Ext.get('plant-name').getValue();
	
	Ext.QuickTips.init();
	
	//turn on validation errors beside the field globally
	Ext.form.Field.prototype.msgTarget = 'side';

	var fm = Ext.form;

	//Form to submit changes.
	var generalForm = new Ext.form.BasicForm(Ext.get("general-form"),{});
		
	//Jobs type
    dsJobType = new Ext.data.Store(
	{
		proxy: new Ext.data.HttpProxy({url:'php/jobs_data.php', method:'post'}),
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
	
	dsJobType.load();
	
	//Blocks
    dsBlock = new Ext.data.Store(
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

	//Sizes
    dsSize = new Ext.data.Store(
	{
		proxy: new Ext.data.HttpProxy({url:'../sizes/php/sizes_data.php', method:'post'}),
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

	dsSize.on('load', function()
	{
		size.setValue(plantInfo.size);	
	});
	
	dsSize.load();

    //Labors
    dsLabor = new Ext.data.Store(
	{
		proxy: new Ext.data.HttpProxy({url:'php/labors_data.php', method:'post'}),
    	reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
                {name:'id', type:'int'},
				{name:'job_id', type:'int'}, 
				{name:'name', type:'string'},
				{name:'cost', type:'float'},
				{name:'days', type:'int'}
			]
        })	    
	});

	dsLabor.on('load', selectProperLabor);
	
	//Labors
    dsJobLabor = new Ext.data.Store(
	{
		proxy: new Ext.data.HttpProxy({url:'php/jobslabors_data.php', method:'post'}),
    	reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
                {name:'id_job', type:'int'}, 
				{name:'labor', type:'string'},
				{name:'cost', type:'string'}
			]
        })	    
	});

	//create the Data Store
    dsMaterial = new Ext.data.Store(
	{
		proxy: new Ext.data.HttpProxy({url:'php/materials_data.php', method:'post'}),
    	reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
                {name:'id', type:'int'}, 
				{name:'name', type:'string'},
				{name:'cost', type:'float'},
				{name:'days', type:'int'}
			]
        })
    });

	dsMaterial.on('load', selectProperMaterial);
		
	// create the Data Store
    dsJob = new Ext.data.GroupingStore(
	{
		//TODO
		proxy: new Ext.data.HttpProxy({url:'php/plant_data.php?plant_id=' + plantId + '&completed=1', method:'post'}),
		reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            fields: [
   				{name: 'id', type: 'int'},
    			{name: 'inventory_id', type: 'int'},
    			{name: 'job_id', type: 'int'},
    			{name: 'job_name', type:'string'},
    			{name: 'ref'},
    			{name: 'id_material'},
    			{name: 'material_name'} ,
    			{name: 'material_cost', type: 'float'},
    			{name: 'labor_id'},
    			{name: 'labor_name'},
				{name: 'notes'},
    			{name: 'labor_cost', type: 'float'},
    			{name: 'date', type: 'date', dateFormat: 'Y-m-d'} ,
				{name: 'completed_date', type: 'date', dateFormat: 'Y-m-d'},
				{name: 'programmed_date', type: 'date', dateFormat: 'Y-m-d'}
			]
        }),
		sortInfo	:	{field	:	'date', direction	:	'DESC'},
		//groupField	:	'ref',
		groupField	:	'job_name',
		autoLoad	:	true
    });

	dsJob.on('load', calculatePricing);
		
	//create the Data Store
    dsPendingJob = new Ext.data.GroupingStore(
	{
		//TODO 		
		proxy: new Ext.data.HttpProxy({url:'php/plant_data.php?plant_id=' + plantId + '&completed=0', method:'post'}),
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
    			{name: 'ref'},
    			{name: 'id_material'},
    			{name: 'material_name'} ,
    			{name: 'material_cost', type: 'float'},
    			{name: 'labor_id'},
    			{name: 'labor_name'},
				{name: 'notes'},
    			{name: 'labor_cost', type: 'float'},
    			{name: 'date', type: 'date', dateFormat: 'Y-m-d'} //Scheduled date
			]
        }),
		sortInfo	:	{field	:	'job_id', direction	:	'ASC'},
		//groupField	:	'ref',
		groupField	:	'job_name',
		autoLoad	:	true
    });
    
	//create the Data Store
    dsSell = new Ext.data.GroupingStore(
	{
		//TODO 		
		proxy: new Ext.data.HttpProxy({url:'/sell/php/sell_data.php?plant_id=' + plantId, method:'post'}),
		reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
   				{name: 'id', type: 'int'},
    			{name: 'order_no', type: 'int'},
    			{name: 'plant_id', type: 'int'},
    			{name: 'plant', type:'string'},
    			{name: 'qty', type:'int'},
    			{name: 'date', type: 'date', dateFormat: 'Y-m-d'} 
			]
        }),
		sortInfo	:	{field	:	'id', direction	:	'DESC'},
		groupField	:	'date',
		autoLoad	:	true
    });
    
    //Job type
    jobType = new Ext.form.ComboBox(
    {
        store: dsJobType,
        valueField:'id',
        displayField:'name',
        typeAhead: true,
		editable:false,
        triggerAction: 'all'
    });
    
    jobType.on('select', loadData);
    
    //Material
    material = new Ext.form.ComboBox(
    {
        store: dsMaterial,
        valueField:'name',
        displayField:'name',
        typeAhead: true,
		editable:false,
	    triggerAction: 'all'
    });

	material.on('select', setMaterial);    
	material.on('focus', function()
	{
		loadMaterials(true);
	});

    //Material
    labor = new Ext.form.ComboBox(
    {
        store: dsLabor,
        valueField:'name',
        displayField:'name',
        typeAhead: true,
		editable:false,
		//mode:'local',
        triggerAction: 'all'
    });

	labor.on('select', setLabor);    
	labor.on('focus', function()
	{
		loadLabors(true);
	});
		
    var jobColumnModel = new Ext.grid.ColumnModel([
	{
		header		:	'Job Name ',
		dataIndex	:	'job_name',
		sortable	:	true
	},
	{
		header		:	'Closed Date',
		dataIndex	:	'completed_date',		
		renderer	:	Ext.util.Format.dateRenderer('m/d/y'),
		sortable	:	true 
	},
	{
		header		:	'Scheduled Date',
		dataIndex	:	'programmed_date',		
		renderer	:	Ext.util.Format.dateRenderer('m/d/y'),
		hidden: true,
		sortable	:	true 
	},
	/*{
		header		:	'',
		dataIndex	:	'ref',
		sortable	:	true
	},*/ 
	{
		header		:	'Material',
		dataIndex	:	'material_name',
		sortable	:	true
	},
	{
		header		:	'Cost', 
		dataIndex	:	'material_cost',
		align: 'right',
		sortable	:	true,
		summaryType	:	'sum',
		summaryRenderer: materialCost,		
		renderer: Ext.util.Format.usMoney
	},
	{
		header		:	'Labor',
		dataIndex	:	'labor_name',
		sortable	:	true
	},
	{
		header		:	'Cost', 
		dataIndex	:	'labor_cost',
		align: 'right',
		sortable	:	true,
		summaryType	:	'sum',		
		summaryRenderer: laborCost,
		renderer: Ext.util.Format.usMoney
	},
	{
		header		:	'Notes',
		dataIndex	:	'notes',
		hidden:true
	}
	]);

	
    var pendingJobColumnModel = new Ext.grid.ColumnModel([
	{
		header		:	'Job Name ',
		dataIndex	:	'job_name',
		sortable	:	true
	},
	{
		header		:	'Scheduled Date',
		dataIndex	:	'date',
		
		renderer	:	Ext.util.Format.dateRenderer('m/d/y'),
		sortable	:	true 
	},
	{
		header		:	'Material',
		dataIndex	:	'material_name',
		sortable	:	true
	},
	{
		header		:	'Cost', 
		dataIndex	:	'material_cost',
		align: 'right',
		sortable	:	true,
		summaryType	:	'sum',		
		summaryRenderer: materialCost,
		renderer: Ext.util.Format.usMoney
	},
	{
		header		:	'Labor',
		dataIndex	:	'labor_name',
		sortable	:	true
	},
	{
		header		:	'Cost', 
		dataIndex	:	'labor_cost',
		align: 'right',
		sortable	:	true,
		summaryType	:	'sum',		
		summaryRenderer: laborCost,
		renderer: Ext.util.Format.usMoney
	}]);

    var sellColumnModel = new Ext.grid.ColumnModel([
	{
		header		:	'Date',
		dataIndex	:	'date',
		renderer	:	Ext.util.Format.dateRenderer('m/d/y'),
		sortable	:	true
	},
	{
		header		:	'Qty',
		dataIndex	:	'qty',
		summaryType :   'sum',
		sortable	:	true,
		align:'right' 
	},
	{
		header		:	'Order No',
		dataIndex	:	'order_no',
		sortable	:	true
	}]);

	var jobGrouping = new Ext.grid.GroupSummary();	
	var jobSummary = new Ext.ux.grid.GridSummary();
	
	// create the Grid
	grid = new Ext.grid.EditorGridPanel( {
		collapsible:true, 
		store :dsJob,
		//frame:true, 	
		cm:jobColumnModel,
		selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),
		stripeRows :true,
		autoScroll:'auto',
		autoSizeColumns:true,
		autoSizeHeaders:true,
		title :'Closed Jobs - ' + plantNameValue,
		plugins		: [jobSummary, jobGrouping],
    	view	:	new Ext.grid.GroupingView(
		{
				forceFit		:	false,
				showGroupName	:	false,
				startCollapsed	:	true,
				enableGrouping 	:	false,
				hideGroupedColumn	:	true,				
		        //groupTextTpl: '{text}&nbsp;({[values.rs.length]})&nbsp;&nbsp;&nbsp;Job:&nbsp;{[values.rs[0].data.job_name]}&nbsp;&nbsp;&nbsp;Material:&nbsp;{[values.rs[0].data.material_name]}&nbsp;&nbsp;&nbsp;Cost:&nbsp;{[Ext.util.Format.usMoney(values.rs[0].data.material_cost)]}&nbsp;&nbsp;&nbsp;Labor:&nbsp;{[values.rs[0].data.labor_name]}&nbsp;&nbsp;&nbsp;Cost:&nbsp;{[Ext.util.Format.usMoney(values.rs[0].data.labor_cost)]}&nbsp;&nbsp;&nbsp;&nbsp;{[formatDate(values.rs[0].data.date)]}'
				groupTextTpl: '{text}&nbsp;({[values.rs.length]})&nbsp;-&nbsp;<label style="color:black">{[formatDate(values.rs[0].data.completed_date)]}&nbsp;-&nbsp;{[values.rs[0].data.material_name]}</label>'
		}),
        clicksToEdit:1,
		viewConfig: 
		{
            forceFit:false
        },
		tbar: [
        {
            text: 'Add',
            handler: function()
			{
				showDialog(true);
			}            
        },
		{
			text	:	'Delete',
			handler	:	deleteJob
		},
		{
			text	:	'Refresh',
			handler	:	function()
			{
				grid.store.load();
			}
		}]
	});

	var pendingJobGrouping = new Ext.grid.GroupSummary();	
	var pendingJobSummary = new Ext.ux.grid.GridSummary();

	
	//Pending jobs
	gridPendingJobs = new Ext.grid.EditorGridPanel( 
	{
		collapsible:true,
		store :dsPendingJob,
		cm:pendingJobColumnModel,
		stripeRows :true,
		selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),
		//frame:true,
		autoScroll:'auto', 
		plugins		: [pendingJobSummary, pendingJobGrouping],
    	view	:	new Ext.grid.GroupingView(
		{
				forceFit		:	false,
				showGroupName	:	false,
				startCollapsed	:	true,
				enableGrouping 	:	false,
				hideGroupedColumn	:	true,				
				// custom grouping text template to display the number of items per group
		        //groupTextTpl: '{text}&nbsp;({[values.rs.length]})&nbsp;&nbsp;&nbsp;Job:&nbsp;{[values.rs[0].data.job_name]}&nbsp;&nbsp;&nbsp;Material:&nbsp;{[values.rs[0].data.material_name]}&nbsp;&nbsp;&nbsp;Cost:&nbsp;{[Ext.util.Format.usMoney(values.rs[0].data.material_cost)]}&nbsp;&nbsp;&nbsp;Labor:&nbsp;{[values.rs[0].data.labor_name]}&nbsp;&nbsp;&nbsp;Cost:&nbsp;{[Ext.util.Format.usMoney(values.rs[0].data.labor_cost)]}&nbsp;&nbsp;&nbsp;&nbsp;{[formatDate(values.rs[0].data.date)]}'
				groupTextTpl: '{[values.rs[0].data.job_name]}&nbsp;({[values.rs.length]})&nbsp;-&nbsp;<label style="color:black">{[formatDate(values.rs[0].data.date)]}&nbsp;-&nbsp;{[values.rs[0].data.material_name]}</label>'
		}),

		clicksToEdit:1,
		viewConfig: 
		{
            forceFit:false
        },			
		//height :350,		
		title :'Pending Jobs - ' + plantNameValue,
		tbar: [
        {
            text: 'Add',
            handler: function()
			{
				showDialog(false);
			}
        },
		{
			text	:	'Delete',
			handler	:	deletePendingJob
		},
		{
			text	:	'Refresh',
			handler	:	function()
			{
				gridPendingJobs.store.load();
			}
		}]
	});

	var sellGrouping = new Ext.grid.GroupSummary();	
	var sellSummary = new Ext.ux.grid.GridSummary();
	
	//Pending jobs
	gridSell = new Ext.grid.EditorGridPanel( 
	{
		collapsible:true,
		store :dsSell,
		cm:sellColumnModel,
		stripeRows :true,
		selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),
		//frame:true,
		autoScroll:'auto', 
		plugins		: [sellSummary, sellGrouping],
    	view	:	new Ext.grid.GroupingView(
		{
				forceFit		:	false,
				showGroupName	:	false,
				startCollapsed	:	false,
				enableGrouping 	:	true,
				hideGroupedColumn	:	false,				
				// custom grouping text template to display the number of items per group
				groupTextTpl: '{[formatDate(values.rs[0].data.date)]}&nbsp;({[values.rs.length]})'
		}),

		clicksToEdit:1,
		viewConfig: 
		{
            forceFit:false
        },			
		title :'Sell - ' + plantNameValue,
		tbar: [
        {
			text	:	'Refresh',
			handler	:	function()
			{
				gridPendingJobs.store.load();
			}
		}]
	});

	var formPanel = new Ext.FormPanel( 
	{
		title :'Plant Detail',		
		labelAlign :'right',
		labelWidth: 80,
		frame:true,
		height: 190,
		defaults:
		{
			bodyStyle: 'padding-top:25px'
		},
		region: "north",	
		items : [ 
		{
			layout :'column',
			items : [ 
			 {
				//columnWidth :200,
				layout :'form',
				//autoScroll:'auto',
				items : [
				new Ext.form.TextField(
				{
				    fieldLabel: 'Plant Id',
				    name: 'plant_name',
					style:'text-align:right',
					disabled:true,
				    //anchor		: '95%',
					width:120,
				    value: plantId
				}),
				date = new Ext.form.DateField(
				{
				    fieldLabel: 'Date Planted',
				    name: 'date_planted',					
				    emptyText: 'Pick a date',
				    //anchor		: '95%',
					width:120,
					format: 'm/d/y', 
				    value: plantInfo.date_planted
				}),
				plantName = new Ext.form.TextField(
				{
				    fieldLabel: 'Plant Name',
				    name: 'plant_name',
				    //anchor		: '95%',
					width:120,
				    value: plantInfo.plant
				}),				
		        block = new Ext.form.ComboBox(
		        {
                    fieldLabel: 'Blocks',                        
                    store: dsBlock,
                    valueField:'id',
                    displayField:'name',
					//anchor		: '95%',
					width:120,
                    typeAhead: true,
					editable:false,
                    triggerAction: 'all',
					value:plantInfo.block
                })				 
				]
			}, 
			{
				//columnWidth :.25,
				layout :'form',
				//autoScroll:'auto',
				items : [
				size = new Ext.form.ComboBox(
		        {
		            fieldLabel: 'Sizes',                        
		            store: dsSize,
		            valueField:'id',
		            displayField:'name',
		            typeAhead: true,
					//anchor		: '95%',
					width:50,
					editable:false,
		            triggerAction: 'all'
		        }),				
				days = new Ext.form.TextField(
				{
				    fieldLabel: 'Days',
				    name: 'days',
				    //anchor		: '95%',
					width:50,
				    value: plantInfo.days
				}),
				qty = new Ext.form.TextField(
				{
				    fieldLabel: 'Qty',
				    name: 'qty',
				    //anchor		: '95%',
					width:50,
				    value: plantInfo.qty
				})
		        ]
			},
			{
				//columnWidth :.20,
				layout :'form',
				//autoScroll:'auto',
				title:'Price&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
					  '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + 
					  '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
					  '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' +
					  '&nbsp;&nbsp;&nbsp;&nbsp;',
				items : [
				sell = new Ext.form.NumberField(
				{
				    fieldLabel: 'Sell',
				    name: 'sell',
				    value: plantInfo.sell_price,
					renderer: Ext.util.Format.usMoney,
					//anchor		: '98%',
					width: 70,
					decimalPrecision: 3,
					style:'text-align:right',
					listeners:{'change':calculatePricing}
				}),
				margin = new Ext.form.NumberField(
				{
				    fieldLabel: 'Margin (%)',
				    name: 'margin',
				    value: plantInfo.margin,
					decimalPrecision: 0,
					//anchor		: '98%',
					width: 70,
					style:'text-align:right',
					listeners:{'change':calculatePricing}
				}),
				cost = new Ext.form.NumberField(
				{
				    fieldLabel: 'Cost',
				    name: 'cost',					
					//anchor		: '98%',
					width: 70,
					decimalPrecision: 3,					
					style:'text-align:right',
				    value: plantInfo.budget_cost
				}),	
				profit = new Ext.form.NumberField(
				{
				    fieldLabel: 'Profit',
				    name: 'profit',
					//anchor		: '98%',
					width: 70,
					decimalPrecision: 3,
					style:'text-align:right',
				    value: plantInfo.profit
				})
		        ]
			}, //Actual
			{
				//columnWidth :.14,
				layout :'form',
				title:'Actual&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
				//autoScroll:'auto',
				defaults:
				{
					hideLabel	: true						
				},
				items : [
				actualSell = new Ext.form.NumberField(
				{
				    //fieldLabel: 'Sell',
				    name: 'actual_sell',
				    value: "0",
					renderer: Ext.util.Format.usMoney,
					//anchor		: '100%',
					width: 70,
					decimalPrecision: 3,
					style:'text-align:right',
					listeners:{'change':calculatePricing}
				}),
				actualMargin = new Ext.form.NumberField(
				{
				    //fieldLabel: 'Margin (%)',
				    name: 'margin',
				    value: "0",
					decimalPrecision: 0,
					//anchor		: '100%',
					width: 70,
					style:'text-align:right',
					listeners:{'change':calculatePricing}
				}),
				actualCost = new Ext.form.NumberField(
				{
				    //fieldLabel: 'Cost',
				    name: 'cost',					
					//anchor		: '100%',
					width: 70,
					decimalPrecision: 3,
					style:'text-align:right',
				    value: "0"
				}),	
				actualProfit = new Ext.form.NumberField(
				{
				    //fieldLabel: 'Profit',
				    name: 'profit',
					//anchor		: '100%',
					width: 70,
					decimalPrecision: 3,
					style:'text-align:right',
				    value: "0"
				})
		        ]
			}, //Final
			{
				//columnWidth :.14,
				layout :'form',
				title:'Diff&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
				labelWidth	: 1,
				//autoScroll:'auto',
				defaults:
				{ 
					hideLabel	: false,
					labelSeparator	:	''
				},
				items : [
				finalSell = new Ext.form.NumberField(
				{
				    //fieldLabel: 'Sell',					
					name: 'sell',
				    value: "0",					
					renderer: Ext.util.Format.usMoney,
					//anchor		: '100%',
					width: 70,
					decimalPrecision: 3,
					style:'text-align:right',
					listeners:{'change':calculatePricing}
				}),
				finalMargin = new Ext.form.NumberField(
				{
				    //fieldLabel: 'Margin (%)',
				    name: 'margin',
				    value: "0",
					decimalPrecision: 0,
					//anchor		: '100%',
					width: 70,
					style:'text-align:right',
					listeners:{'change':calculatePricing}
				}),
				finalCost = new Ext.form.NumberField(
				{
				    //fieldLabel: 'Cost',
				    name: 'cost',					
					//anchor		: '100%',
					width: 70,
					decimalPrecision: 3,
					style:'text-align:right',
				    value: "0"
				}),	
				finalProfit = new Ext.form.NumberField(
				{
				    //fieldLabel: 'Profit',
				    name: 'profit',
					//anchor		: '100%',
					width: 70,
					decimalPrecision: 3,
					style:'text-align:right',
				    value: "0"
				})
		        ]
			}]			 
		}
		]
	});
	
	var viewport = new Ext.Viewport(
	{
		layout: "border",
		items:[				
		formPanel,		
		{
			xtype: 'tabpanel',
			region: 'center',
			plain: true,
			activeTab: 0,
			items: [grid, gridPendingJobs, gridSell],
			buttonAlign:'center',
			buttons : [ 
			{
				text :'Save',
	            handler: savePlant
			},
			{
				text :'Split Plant',
	            handler: function()
				{
					Ext.MessageBox.prompt('Split Plant', 'Please enter qty:', splitPlant);
				}
			},
			{
				text :'Dump Plant',
	            handler: function()
				{
					Ext.MessageBox.prompt('Dump Plant', 'Please enter qty:', dumpPlant);
				}
			},
			{
				text :'Delete plant',
	            handler: deletePlant
			}]
		}]
	});
	
	setup();
	
	function setup()
	{
		dsBlock.on('load', function()
		{
			block.setValue(plantInfo.block);	
		});
		
		dsBlock.load();
	}
	
	/**
	 * When a job is selected load the materials and labors.
	 */
	function loadData()
	{
		loadMaterials(false);
		loadLabors(false);
	}	
	
	/**
	 * Load the materials based on the selected job.
	 * True if the function is called from the combobox.
	 * @param {boolean} material
	 */
	function loadMaterials(material)
	{
		if (material) 
		{
			var rows = auxJobGrid.getSelectionModel().getSelections();
			
			if (rows.length > 0) 
				loadMaterialsByJob(rows[0].get('id_job'));
		}
		else 
			loadMaterialsByJob(jobType.getValue());
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
	
	/**
	 * Set the material and select the cost.
	 */
	function setMaterial()
	{
		var rows = auxJobGrid.getSelectionModel().getSelections();
			
		if (rows.length > 0) 
		{
			var value = material.getValue();			
			
			var index = material.store.find('name', value);
			var record = material.store.getAt(index);
		
			if (record != undefined) 
			{
				rows[0].set('material_cost', record.get('cost'));
				rows[0].set('material', value);
				rows[0].set('days', record.get('days'));
				
				setScheduledDate(rows[0]);
			}
		}		
	}

	/**
	 * Load the labors based on the selected job.
	 * True if the function is called from the combobox.
	 * @param {boolean} labor
	 */
	function loadLabors(labor)
	{	
		if (labor) 
		{
			var rows = auxJobGrid.getSelectionModel().getSelections();
			
			if (rows.length > 0) 
				loadLaborsByJob(rows[0].get('id_job'));
		}
		else 
			loadLaborsByJob(jobType.getValue());		
	}
		
	/**
	 * Load the labors corresponding to the job id.	  
	 * @param {int} value
	 */
	function loadLaborsByJob(value)
	{
		var record = dsJobType.getById(value);
		
		if (record != undefined) 
		{
			var ref = record.get("ref");
			var jobType = record.get('type');
			
			dsLabor.load(
			{
				params: 
				{
					job_id: value,
					job_type: jobType,
					ref: ref
				}
			});
		}
	}
	
	/**
	 * Select the labor cost.
	 */
	function setLabor()
	{
		var rows = auxJobGrid.getSelectionModel().getSelections();
			
		if (rows.length > 0) 
		{
			var value = labor.getValue();
			
			var index = labor.store.find('name', value);
			var record = labor.store.getAt(index);
			
			if(record != undefined)
			{
				rows[0].set('labor_cost', record.get('cost'));
				rows[0].set('labor', value);
				
				if(record.data.job_id == 21)//Weed
				{
					rows[0].set('days', record.get('days'));
					
					setScheduledDate(rows[0]);	
				}
				auxJobGrid.startEditing(dsAuxJob.indexOf(rows[0]), 4);
			}	
		}
	}
	
	/**
	 * When labors load select the proper labor for the current row.
	 */
	function selectProperLabor()
	{
		var rows = auxJobGrid.getSelectionModel().getSelections();
		
		if(rows.length > 0)
		{
			var record = null;
			var selectedSize = size.getRawValue();
			var labor = "";
			
			for(var i = 0; i < dsLabor.getCount(); i++)
			{
				record = dsLabor.getAt(i); 	
				labor = record.data.name;
				
				if(labor.toString().indexOf(selectedSize) != -1)
				{
					rows[0].set('labor', labor);
					rows[0].set('labor_cost', record.data.cost);
			
					if(record.data.job_id == 21)//Weed
					{
						rows[0].set('days', record.get('days'));
						
						setScheduledDate(rows[0]);	
					}
						
					return;
				}
			}
			
			rows[0].set('labor', '');
			rows[0].set('labor_cost', 0);
		}
	}	
	
	/**
	 * When materials load select the proper material for the current row only if.
	 */
	function selectProperMaterial()
	{
		var rows = auxJobGrid.getSelectionModel().getSelections();
		
		if(rows.length > 0)
		{
			var record = null;
			var selectedSize = size.getRawValue();
			var material = "";
			
			for(var i = 0; i < dsMaterial.getCount(); i++)
			{
				record = dsMaterial.getAt(i); 	
				material = record.data.name;
				
				if(material.toString().indexOf(selectedSize) != -1  && selectedSize != "")
				{
					rows[0].set('material', material);
					rows[0].set('material_cost', record.data.cost);
					rows[0].set('days', record.data.days);
					
					setScheduledDate(rows[0]);
					return;
				}
			}
			
			rows[0].set('material', '');
			rows[0].set('material_cost', 0);
			rows[0].set('days', 0);
			
			setScheduledDate(rows[0]);
		}
	}
	
	/**
	 * Add jobs to the grid
	 */
	function addJob()
	{
		var row =  new Ext.data.Record(
		{
			id:0, 
			id_job:'',
			material:'',
			material_cost:'',
			labor:'',
			labor_cost:'',
			date: date.getValue(),
			completed:completedJob,
			scheduled_date:'',
			days:0,
			insert:true
		});
			
		dsAuxJob.add(row);		
	}
	
	/**
	 * Calculate the cost and profit 
	 */
	function calculatePricing()
	{
		var sellValue, marginValue, costValue, profitValue, totalJob = 0, totalLabor = 0;
		var actualSellValue, actualMarginValue, actualCostValue, actualProfitValue;
		var finalSellValue, finalMarginValue, finalCostValue, finalProfitValue;
		
		sellValue = sell.getValue();
		marginValue = margin.getValue();
		
		costValue = sellValue - (sellValue * marginValue) / 100;
		profitValue = (sellValue - costValue);
			
		cost.setValue(costValue);
		profit.setValue(profitValue);
		
		var record = null;
		
		for(var i = 0; i < dsJob.getCount(); i++)
		{
			record = dsJob.getAt(i)
			
			totalJob += (record.data.material_cost != undefined) ? record.data.material_cost : 0;
			totalLabor += (record.data.labor_cost != undefined) ? record.data.labor_cost : 0;
		}
		
		//Actual	
		sellValue = parseFloat(sellValue);
		totalJob = parseFloat(totalJob);
		totalLabor = parseFloat(totalLabor);
		
		actualSell.setValue(sellValue);
		actualCostValue = totalJob + totalLabor;
		actualCost.setValue(actualCostValue);
		actualProfitValue = sellValue - actualCostValue;
		actualProfit.setValue(actualProfitValue);
		
		actualMarginValue = (sellValue > 0 ? ((sellValue - (totalJob + totalLabor))/sellValue) * 100: 0);
		//actualMarginValue = (sellValue > 0) ? (sellValue - ((totalJob + totalLabor)/sellValue)) * 100: 0;
		actualMargin.setValue(actualMarginValue);
		
		//Diff
		finalMargin.setValue(actualMarginValue - marginValue);
		finalCost.setValue(actualCostValue - costValue);
		finalProfit.setValue(actualProfitValue - profitValue);
	}
	
	/**
	 * Save the plant into the inventory
	 */
	function savePlant()
	{
	    Ext.MessageBox.show(
	    {
	       title:'Save Plant',
	       msg: 'Do you want to save this plant?',
	       buttons: Ext.MessageBox.YESNOCANCEL, 
	       fn: function(btn)
		   {
	   			if(btn == 'yes')  /// proceed to save
				{
					jsonData = "";
					
					var row =  new Ext.data.Record(
					{
						id		:	plantId, 
						date	:	date.getValue(),
						name	:	plantName.getValue(),
						block	:	block.getValue(),
						size	:	size.getValue(),
						days	:	days.getValue(),				
						qty		:	qty.getValue(),
						sell	:	sell.getValue(),
						margin	:	margin.getValue(),
						budget	:	cost.getValue(),
						profit	:	profit.getValue()
					});
					
					jsonData = "[" + Ext.util.JSON.encode(row.data) + "]";
					
					generalForm.submit(
					{
						waitMsg: 'Saving the plant, please wait...',
						url:	"php/process_plant.php",
						params: 
						{
							data: jsonData
						}, 
						success:function(form, action) 
						{
							//alert('Your changes were saved!');
						},
						failure: function(form, action) 
						{
							alert('Error processing the action.');
						}
					});
				}
			},
	       //animEl: 'save-plant-button',
	       icon: Ext.MessageBox.QUESTION
	   });
	}

	/**
	 * Delete selected jobs
	 */
	function deleteJob()
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
						jsonData += '{"delete_job":true, "id":"' + rows[i].data.id + '"}' + (rows.length == i + 1 ? "" : "," );

					jsonData = "[" + jsonData + "]";
					 
					generalForm.submit(
					{
						waitMsg: 'Deleting rows, please wait...',
						url:"php/process_plant.php",										
						params:{data:jsonData},
						success:function(form, action) 
						{
							//alert('Your changes were saved!');
							
							grid.store.load();
							gridPendingJobs.store.load();
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
 
 	/**
	 * Delete selected pending jobs
	 */
	function deletePendingJob()
	{	
		Ext.MessageBox.confirm('Confirm', 'Do you want to continue?', function(value)
		{
			var rows = gridPendingJobs.getSelectionModel().getSelections();
			
			if(rows.length > 0)
			{
				if(value == 'yes')
				{									
					var jsonData = '';
					
					for(var i = 0; i < rows.length; i++)
						jsonData += '{"delete_job":true, "id":"' + rows[i].data.id + '"}' + (rows.length == i + 1 ? "" : "," );

					jsonData = "[" + jsonData + "]";
					 
					generalForm.submit(
					{
						waitMsg: 'Deleting rows, please wait...',
						url:"php/process_plant.php",										
						params:{data:jsonData},
						success:function(form, action) 
						{
							//alert('Your changes were saved!');
							
							gridPendingJobs.store.load();
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
	
	/**
	 * When the user select a size automatically load the corresponding labors for the jobs.
	 */
	function loadJobLabors()
	{
		//Get all jobs id
		var count = 0, ids = "", sizeValue = "";
		
		count = dsJob.getCount();
		sizeValue = size.getRawValue();
		
		for (var i = 0; i < count; i++)
		{
			record = dsJob.getAt(i);
						
			ids += "" + record.get('id_job') + (i + 1 < count ? "," : "");
		} 
		
		dsJobLabor.load(
		{
			params: 
			{
				id_job: ids,
				size: sizeValue
			}
		});
	}
	
	/**
	 * Create a grid to which will be added into the dialog to add 
	 * new jobs.
	 */
	function createJobGrid()
	{
		var fm = Ext.form;
		
		jobDate = new fm.DateField(
	    {
	       format: 'm/d/y',
	       minValue: '01/01/06',
		   listeners:{'change': setJobScheduledDate}
	    });
		
    	var cm = new Ext.grid.ColumnModel([
   		{
	      	header		: "Job Name",
	      	dataIndex	: 'id_job',
	      	editor		: jobType,		
			renderer:function(value)
			{
					var r = dsJobType.getById(value);
					
					if(r == undefined)
					{
						if(value == 2) return 'Fertilizer';
						else if (value == 8) return 'Pot';
							else if (value == 9) return 'Soil';
					}
					else
		    			return r ? r.get('name') : '<unknown>';
			}          	          	
	   	},
		{
	   		header: "Material",
	        dataIndex: 'material',
	        editor: material/*,
			renderer:function(value)
			{
				var r = dsMaterial.getById(value);
				
	    		return r ? r.get('name') : '<unknown>';	
			}*/
		},
	   	{
			header		:	"Cost",
	   		dataIndex	:	"material_cost",
	   		summaryType	:	'sum',
			renderer: Ext.util.Format.usMoney,
	   		align: 'right',
	   		editor: new fm.NumberField(
	   		{
	                  allowBlank: false,
	                  allowNegative: false,
	                  maxValue: 100,
					  decimalPrecision: 3				  
	        })
	   	},
	   	{
	   		header: "Labor",
	        dataIndex: 'labor',
	        editor: labor
	   	},
	   	{
	   		header		:	"Cost",
	   		dataIndex	:	"labor_cost",
	   		summaryType	:	'sum',
			renderer: Ext.util.Format.usMoney,
	   		align: 'right',
	   		editor: new fm.NumberField(
	   		{
	              allowBlank: false,
	              allowNegative: false,
	              maxValue: 100,
				  decimalPrecision: 3
	        })
	   	},
	   	{
	   		header: "Closed Date",
	        dataIndex: 'date',
	        renderer: formatDate,
	        editor: jobDate
	   	},
		{
	   		header: "Scheduled Date",
	        dataIndex: 'scheduled_date',
	        renderer: formatDate
	   	}]);
	
	    cm.defaultSortable = true;
	
		// create the Data Store
	    dsAuxJob = new Ext.data.Store(
		{
			proxy: new Ext.data.HttpProxy({url:'php/job_template_data.php', method:'post'}),
	    	reader: new Ext.data.JsonReader(
			{
	            root: 'data',
	            totalProperty: 'totalCount',
	            id: 'id',
	            fields: [
	                {name:'id_job', type:'int'},
					{name:'material', type:'string'},				
					{name:'material_cost', type:'float'},
					{name:'labor', type:'string'},
					{name:'labor_cost', type:'float'},				 
					{name:'date', type:'date'},
					{name:'completed', type:'boolean'},
					{name:'scheduled_date', type:'date'},
					{name:'days', type:'int'}
				]
	        })
	    });
		
		var summary = new Ext.ux.grid.GridSummary();
	
		// create the Grid
		auxJobGrid = new Ext.grid.EditorGridPanel( 
		{
			store :dsAuxJob,
			frame:true, 	
			cm:cm,
			selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),
			stripeRows :true,
			height :250,
			plugins		: [summary],
	        clicksToEdit:1,
			viewConfig: 
			{
	            forceFit:true
	        },
			tbar: [
	        {
	            text: 'Add',
	            handler: function()
				{
					addJob();
				}            
	        },
			{
				text	:	'Delete',
				handler	:	function()
				{
					var rows = auxJobGrid.getSelectionModel().getSelections();
			
					if (rows.length > 0) 
						dsAuxJob.remove(rows[0]);		
					else
						Ext.MessageBox.alert('Status', 'Please select a row to delete!');
				}
			}]
		});		
		
		auxJobGrid.on('beforeedit', function(e)
		{
			auxJobGrid.getSelectionModel().selectRow(e.row, false);
		});
	}
	
	/**
	 * Show the dialog with the grid to add new jobs and then added into the
	 * proper grid, completed jobs or pending jobs.
	 * @param {Boolean} completedJob
	 */
	function showDialog(auxCompletedJob)
	{
		completedJob = auxCompletedJob;
		
		// create the window on the first click and reuse on subsequent clicks
        if(!jobDialog)
		{
			createJobGrid();
			
			jobDialog = new Ext.Window(
			{
                applyTo     : 'hello-win',
                layout      : 'fit',
                width       : 700, 
                height      : 400,
				modal		: true,
                closeAction :'hide',
                plain       : true,            
				items		:	[auxJobGrid],				
                buttons: [
				{
                    text     : 'Save',
					handler	 : function ()
					{
						grid.stopEditing(false);
						
						jsonData = "";
						
						for(i = 0 ; i < dsAuxJob.getCount() ; i++ )
						{
							var row = dsAuxJob.getAt(i);
														
							if(row.data.insert || row.dirty) 
								jsonData += Ext.util.JSON.encode(row.data) + ",";
						}
						
						if (jsonData.length > 0) 
						{
							jsonData = "[" + jsonData.substring(0, jsonData.length - 1) + "]";
						}
						
						generalForm.submit(
						{
							waitMsg: 'Saving the plant, please wait...',
							url:	"php/add_jobs.php",
							params:
							{
								gridData	:	jsonData,
								id			:	plantId
							}, 
							success:function(form, action) 
							{
								//alert('Your changes were saved!');
								
								dsAuxJob.removeAll();
								
								grid.getStore().load();
								gridPendingJobs.store.load();
								 
								jobDialog.hide();
							},
							failure: function(form, action) 
							{
								alert('Error processing the action.');
							}
						});
					},
                    disabled : false
                },
				{
                    text     : 'Close',
                    handler  : function()
					{
                        jobDialog.hide();
                    }
                }]
            });
        }
		
		//Hide scheduled date column if is a pending job
		auxJobGrid.getColumnModel().setHidden(6, !completedJob);
		auxJobGrid.getColumnModel().setColumnHeader(5, completedJob ? 'Completed Date' : 'Scheduled Date');
		
		jobDialog.setTitle(completedJob ? 'Add new completed jobs' : 'Add new pending jobs');	
        jobDialog.show();
    }
	
	/**
	 * Delete all the information related with this plant.
	 */
	function deletePlant()
	{
		Ext.MessageBox.confirm('Confirm', 'Do you want to continue?', function(value)
		{
			if(value == 'yes')
			{									
				var jsonData = '';
				
				jsonData += '{"delete":true, "id":"' + plantId + '"}';

				jsonData = "[" + jsonData + "]";
				 
				generalForm.submit(
				{
					waitMsg: 'Deleting rows, please wait...',
					url:"php/process_plant.php",										
					params:{data:jsonData},
					success:function(form, action) 
					{
						//alert('Your changes were saved!');
						document.location = "/plants/plants.php";
					},
					failure: function(form, action) 
					{
						alert(action.result.message);					
					}
				});												
			}
		});		
	}
	
	/**
	 * @param {Object} current record where the schedule date will be set.
	 */
	function setScheduledDate(record)
	{
		if(record.data.days != undefined &&  record.data.days != "" && record.data.days > 0)
		{
			var datePlanted = new Date(record.data.date.toGMTString());
			
			if(datePlanted != undefined && datePlanted != "")
			{
				datePlanted.setDate(datePlanted.getDate() + record.data.days);
				
				record.set('scheduled_date', datePlanted); //Add days to the datePlanted object.
			}
		}
		else
			record.set('scheduled_date', ""); 
	}
	
	/**
	 * Called directly from the editor 
	 */
	function setJobScheduledDate()
	{
		var rows = auxJobGrid.getSelectionModel().getSelections();
	
		if (rows.length > 0) 
		{
			var record = rows[0];
			
			if (record.data.days != undefined && record.data.days != "") 
			{
				var auxDate = new Date(jobDate.getValue().toGMTString());
				
				if (auxDate != undefined)
				{
					auxDate.setDate(auxDate.getDate() + record.data.days);
					
					record.set('scheduled_date', auxDate); //Add days to the datePlanted object.				
				}
			}
		}
	}
	
	/**
	 * This function will send the plant id to the server and there will be splited 
	 * based on the qty entered.
	 */
	function splitPlant(btn, text)
	{
		var qtyValue = parseInt(text);
		
		if(qtyValue > 0)
			Ext.MessageBox.confirm('Confirm', 'Do you want to continue?', function(value)
			{
				if(value == 'yes')
				{									
					generalForm.submit(
					{
						waitMsg: 'Spliting plant, please wait...',
						url:"php/process_plant.php",										
						params:{plant_id:plantId, qty: qtyValue, split:true},
						success:function(form, action) 
						{
							document.location.href = "/plants/view_plant.php?id=" + action.result.plant_id;	
						},
						failure: function(form, action) 
						{
							alert(action.result.message);					
						}
					});												
				}
			});
		else
			alert("Can't split the plant.");
	}
	
	/**
	 * This function will send the plant id to the server and there will be splited 
	 * based on the qty entered.
	 */
	function dumpPlant(btn, text)
	{
		var qtyValue = parseInt(text);
		
		if(qtyValue > 0)
			Ext.MessageBox.confirm('Confirm', 'Do you want to continue?', function(value)
			{
				if(value == 'yes')
				{									
					generalForm.submit(
					{
						waitMsg: 'Dumping plant, please wait...',
						url:"php/process_plant.php",										
						params:{plant_id:plantId, qty: qtyValue, dump:true},
						success:function(form, action) 
						{
							document.location.reload();	
						},
						failure: function(form, action) 
						{
							alert(action.result.message);					
						}
					});												
				}
			});
		else
			alert("Can't dump the plant.");
	}
});