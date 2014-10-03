/**
 * @author Greivin
 */

/**
 * Datasources
 */
var dsJob;
var dsPendingJob;
var dsJobType;
var dsTemplate;
var dsMaterial;
var dsLabor;
var dsSize;
var dsBlock;
var dsJobLabor;
var dsPlant;
var dsDefault;

/**
 * Editors
 */
var jobType;
var material;
var date;
var plantName;
var labor;
var block;
var size;
var days;
var qty;
var sell;
var margin;
var cost;
var profit;
var template;
var jobDate;

var jobTypePending;
var materialPending;
var laborPending;

var completedJob = true;
var materialChanged = false;
var jobTypeChanged = false;
var sizeChanged = false;
var sizeFirstLoad = true;

var pieceWorkType = null;
var hours = null;
var totalCost = null;
var currentRow = null;
var formPanelLaborCost = null;
var dialog = null;
var employeeGrid = null;

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

Ext.onReady( function() 
{
	Ext.QuickTips.init();
	
	function formatDate(value)
	{
        return value ? value.dateFormat('M d, Y') : '';
    };

	function laborCost(v, params, data) 
	{
		return Ext.util.Format.usMoney(v);
	}
	
	function materialCost(v, params, data) 
	{
		return Ext.util.Format.usMoney(v);
	}
    
	//turn on validation errors beside the field globally
	Ext.form.Field.prototype.msgTarget = 'side';

	var fm = Ext.form;

	var generalForm = new Ext.form.BasicForm
					(
						Ext.get("general-form"),
						{}
					);	

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
	
	dsEmployee.load();
	
	//default values
	dsDefault = new Ext.data.Store(
	{
		proxy: new Ext.data.HttpProxy({url:'php/default_data.php', method:'post'}),
        reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
                {name:'id', type:'int'}, 
				{name:'default_size', type:'int'},
				{name:'default_days', type:'int'},				
				{name:'default_margin', type:'int'}
			]
        })	    
	});
	
	//Plant
    dsPlant = new Ext.data.Store(
	{
		proxy: new Ext.data.HttpProxy({url:'php/plants_name_data.php', method:'post'}),
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
	
	dsPlant.load();
		
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
	
	//Template
    dsTemplate = new Ext.data.Store(
	{
		proxy: new Ext.data.HttpProxy({url:'php/template_data.php', method:'post'}),
        reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
                {name:'id', type:'int'}, 
				{name:'template', type:'string'},
				{name:'plant', type:'string'},
				{name:'block_id', type:'int'},
				{name:'size_id', type:'int'},
				{name:'days', type:'int'},
				{name:'qty', type:'int'},
				{name:'sell', type:'float'},
				{name:'margin', type:'float'},
				{name:'cost', type:'float'},
				{name:'profit', type:'float'}
			]
        })	    
	});

	dsTemplate.load();
	    
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

	dsBlock.load();
	
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
				{name:'name', type:'string'},
				{name:'default_price', type:'float'}
			]
        })	    
	});

	dsSize.on('load', function()
	{
		if (sizeFirstLoad) 
		{
			var sizeId = dsDefault.getAt(0).data.default_size;
			
			size.setValue(sizeId);
			sizeFirstLoad = false;
			
			var record = dsDefault.getAt(0);			
			days.setValue(record.data.default_days);
			
			margin.setValue(record.data.default_margin);
			
			record = dsSize.getById(sizeId);
			sell.setValue(record.get('default_price'));
			
			calculatePricing();
			
			loadJobLabors();			
		}	
	});
	
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
				{name:'days', type:'float'}
			]
        })
    });
	
	dsMaterial.on('load', selectProperMaterial);
	
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

	dsJobLabor.on('load', assignLabors);
	
	// create the Data Store
    dsJob = new Ext.data.Store(
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

	dsJob.on('load', setJobDate);
		
	//create the Data Store
    dsPendingJob = new Ext.data.Store(
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
				{name:'completed', type:'boolean'}
			]
        })
    });
    
    //Job type
    jobType = new Ext.form.ComboBox(
    {
        store: dsJobType,
        valueField:'id',
        displayField:'name',
        foceSeletion:true,
		selectOnFocus:true,
		mode:'local',
        typeAhead: true,
		editable:true,
        triggerAction: 'all'
    });
    
    jobType.on('select', loadData);
	    
    //Material
    material = new Ext.form.ComboBox(
    {
        store: dsMaterial,
        valueField:'name',
        displayField:'name',
        //foceSeletion:true,
		//selectOnFocus:true,
		mode:'local',
        typeAhead: true,
		editable:true,
        triggerAction: 'all'
    });

	material.on('select', setMaterial);
	    
	material.on('focus', function()
	{
		loadMaterials(true);
	});

    //Labor
    labor = new Ext.form.ComboBox(
    {
        store: dsLabor,
        valueField:'name',
        displayField:'name',
        //foceSeletion:true,
		//selectOnFocus:true,
		mode:'local',
        typeAhead: true,
		editable:true,
        triggerAction: 'all'
    });

	labor.on('select', setLabor);    
	labor.on('focus', function()
	{
		loadLabors(true);
	});

	//Pending editors
	//Job type
    jobTypePending = new Ext.form.ComboBox(
    {
        store: dsJobType,
        valueField:'id',
        displayField:'name',
        foceSeletion:true,
		selectOnFocus:true,
		mode:'local',
        typeAhead: true,
		editable:true,
        triggerAction: 'all'
    });
    
	jobTypePending.on('select', loadPendingData);
    
    //Material
    materialPending = new Ext.form.ComboBox(
    {
        store: dsMaterial,
        valueField:'name',
        displayField:'name',
        foceSeletion:true,
		selectOnFocus:true,
		mode:'local',
        typeAhead: true,
		editable:true,
        triggerAction: 'all'
    });

	materialPending.on('select', setPendingMaterial);    
	materialPending.on('focus', function()
	{
		loadPendingMaterials(true)
	});

    //Material
    laborPending = new Ext.form.ComboBox(
    {
        store: dsLabor,
        valueField:'name',
        displayField:'name',
        foceSeletion:true,
		selectOnFocus:true,
		mode:'local',
        typeAhead: true,
		editable:true,
        triggerAction: 'all'
    });

	laborPending.on('select', setPendingLabor);    
	laborPending.on('focus', function()
	{
		loadPendingLabors(true);
	});
	
	template = new Ext.form.ComboBox(
	{
        store: dsTemplate,
		//anchor		: '100%',
		width:120,
		fieldLabel:'Template',
        valueField:'id',
        displayField:'template',        		
        foceSeletion:true,
		//selectOnFocus:true,
		mode:'local',
        typeAhead: true,
		editable:true,
        triggerAction: 'all'
	});

	template.on('select', loadTemplate);

	jobDate = new fm.DateField(
    {
       format: 'm/d/y',
       minValue: '01/01/06',
	   listeners:{'change': setJobScheduledDate}
    });

	var jobColumnModel = new Ext.grid.ColumnModel([
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
						else if (value == 12) return 'Source';
			}
			else
    			return r ? r.get('name') : '<unknown>';
		}          	          	
   	},
	{
   		header: "Closed Date",
        dataIndex: 'date',
        renderer:	Ext.util.Format.dateRenderer('m/d/y'),		
		editor: jobDate
   	},  
	{
   		header: "Scheduled Date",
        dataIndex: 'scheduled_date',
		hidden: true,
		renderer:	Ext.util.Format.dateRenderer('m/d/y')				
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
		summaryRenderer: materialCost,
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
		summaryRenderer: laborCost,
		renderer: Ext.util.Format.usMoney,
   		align: 'right',
   		editor: new fm.NumberField(
   		{
              allowBlank: false,
              allowNegative: false,
              maxValue: 100,
			  decimalPrecision: 3
        })
   	}]);
	
    var pendingJobColumnModel = new Ext.grid.ColumnModel([
   	{
      	header		: "Job Name",
      	dataIndex	: 'id_job',
      	editor		: jobTypePending,		
		renderer:function(value)
		{
			var r = dsJobType.getById(value);
			
			if(r == undefined)
			{
				if(value == 2) return 'Fertilizer';
				else if (value == 8) return 'Pot';
					else if (value == 9) return 'Soil';
						else if (value == 12) return 'Source';
			}
			else
    			return r ? r.get('name') : '<unknown>';
		}          	          	
   	},
   	{
   		header: "Scheduled Date",
        dataIndex: 'date',
        renderer: formatDate,
		visible: false,
        editor: new fm.DateField(
        {
           format: 'm/d/y',
      	    minValue: '01/01/06'       
        })
   	},
	{
   		header: "Material",
        dataIndex: 'material',
        editor: materialPending/*,
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
		summaryRenderer: materialCost,
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
        editor: laborPending
   	},
   	{
   		header		:	"Cost",
   		dataIndex	:	"labor_cost",
		summaryRenderer: laborCost,
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
   	}]);

	var summary = new Ext.ux.grid.GridSummary();
	
	// create the Grid
	var grid = new Ext.grid.EditorGridPanel( {
		collapsible:true, 
		store :dsJob,
		cm:jobColumnModel,
		selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),
		stripeRows :true,
		title :'Startup',
		autoScroll:'auto',
		plugins		: [summary],
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
				addJob('');
			}            
        },
		{
			text	:	'Delete',
			handler	:	deleteJob
		}]
	});

	var summaryPending = new Ext.ux.grid.GridSummary();
	
	//Pending jobs
	var gridPendingJobs = new Ext.grid.EditorGridPanel( 
	{
		collapsible:true,
		store :dsPendingJob,
		cm:pendingJobColumnModel,
		stripeRows :true,
		selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),
		plugins		: summaryPending,
		clicksToEdit:1,
		autoScroll:'auto',
		viewConfig: 
		{
            forceFit:false
        },			
		title :'Pending Jobs',
		tbar: [
        {
            text: 'Add',
            handler: addPendingJob
        },
		{
			text	:	'Delete',
			handler	:	deletePendingJob
		}]
	});

	var formPanel = new Ext.FormPanel( 
	{
		labelAlign :'right',
		frame:true,
		height: 170,
		labelWidth: 80,
		defaults:
		{
			bodyStyle: 'padding-top:43px'
		},
		region: "north",
		items : [
		{
			layout :'column',
			items : [ 
			 {
				//columnWidth :.33,
				layout :'form',
				//autoScroll:'auto',
				items : [
				template, 
				date = new Ext.form.DateField(
				{
				    fieldLabel: 'Date Planted',
				    name: 'date_planted',
				    emptyText: 'Pick a date',					
				    //anchor		: '100%',
					width:120,
					format: 'm/d/y',
					value: new Date()
				}),
				plantName = new Ext.form.ComboBox(
			    {
					fieldLabel: 'Plant Name',
			        store: dsPlant,
					name: 'plant_name',
				    //anchor		: '100%',
					width:120,
			        valueField:'plant',
			        displayField:'plant',
			        typeAhead: true,
					mode:'local',
					//selectOnFocus:true, 
					editable:true,
			        triggerAction: 'all'
			    }),				
		        block = new Ext.form.ComboBox(
		        {
                    fieldLabel: 'Blocks',                        
                    store: dsBlock,
                    valueField:'id',
                    displayField:'name',
					width:120,
					//anchor		: '70%',
					foceSeletion:true,
					mode:'local',
					selectOnFocus:true,
                    typeAhead: true,
					editable:true,
                    triggerAction: 'all'
                })				 
				]
			}, 
			{
				//columnWidth :.33,
				layout :'form',
				//autoScroll:'auto',
				items : [
				size = new Ext.form.ComboBox(
		        {
		            fieldLabel: 'Sizes',                        
		            store: dsSize,
		            valueField:'id',
		            displayField:'name',
					width:50,		            
					//anchor		: '70%',
					foceSeletion:true,
					mode:'local',
					selectOnFocus:true,
                    typeAhead: true,
					editable:true,
                    triggerAction: 'all'
		        }),				
				days = new Ext.form.TextField(
				{
				    fieldLabel: 'Days',
				    name: 'days',
				    //anchor		: '70%',
					width:50,
				    value: ''
				}),
				qty = new Ext.form.NumberField(
				{
				    fieldLabel: 'Qty',
				    name: 'qty',
					allowBlank:false,
					align:'right',
					decimalPrecision:0,
				    //anchor		: '70%',
					width:50,
				    value: '0'
				})
		        ]
			},
			{
				//columnWidth :.33,
				layout :'form',
				//autoScroll:'auto',
				items : [
				sell = new Ext.form.NumberField(
				{
				    fieldLabel: 'Sell',
				    name: 'sell',
				    value: "0",
					renderer: Ext.util.Format.usMoney,
					//anchor		: '70%',
					width: 70, 
					decimalPrecision: 3,
					style:'text-align:right',
					listeners:{'change':calculatePricing}
				}),
				margin = new Ext.form.NumberField(
				{
				    fieldLabel: 'Margin (%)',
				    name: 'margin',
				    value: "0",
					decimalPrecision: 0,
					//anchor		: '70%',
					width: 70,
					style:'text-align:right',
					listeners:{'change':calculatePricing}
				}),
				cost = new Ext.form.NumberField(
				{
				    fieldLabel: 'Cost',
				    name: 'cost',					
					//anchor		: '70%',
					decimalPrecision: 3,
					style:'text-align:right',
					width: 70,
				    value: "0"
				}),	
				profit = new Ext.form.NumberField(
				{
				    fieldLabel: 'Profit',
				    name: 'profit',
					//anchor		: '70%',
					width: 70,
					decimalPrecision: 3,
					style:'text-align:right',
				    value: "0"
				})
		        ]
			} ]			 
		}
		]});

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
			items: [grid, gridPendingJobs],
			buttonAlign:'center',
			buttons : [ 
			{
				text :'Save',
	            handler: savePlant
			}, 
			{
				text :'Save as template',
				handler:saveTemplate
			},
			{
				text :'Reset',
				handler:function()
				{
					formPanel.getForm().reset();
				}
			}]
		}]
	});
	
	setup();
	
	function setup()
	{
		addDefaultJobs();
		
		grid.on('beforeedit', function(e)
		{
			grid.getSelectionModel().selectRow(e.row, false);
		});
		
		gridPendingJobs.on('beforeedit', function(e)
		{
			gridPendingJobs.getSelectionModel().selectRow(e.row, false);
		});
		
		date.on('change', setJobDate);
		
		size.on('select', loadJobLabors);
		
		profit.on('specialkey', function(field, e)
		{
			if(e.getKey() == 9) //Tab
				grid.startEditing(0, 0);				
		});
		
		dsDefault.on('load', function()
		{
			dsSize.load();	
		});
		
		dsDefault.load();									
	}
	
	/**
	 * Takes the datePlanted value and set all the startup jobs to this date.
	 */
	function setJobDate()
	{
		var record = null;
		var datePlanted = date.getValue();
		var auxDate = null;
		
		for(i = 0 ;i < dsJob.getCount(); i++ )
		{
			record = dsJob.getAt(i);
			
			if(record.data.days != undefined && record.data.days != "")
			{
				datePlanted.setDate(datePlanted.getDate() + record.data.days);
				
				record.set('scheduled_date', datePlanted);
			}
			
			//Has to be the last statement because if not the object datePlanted take the value of the auxDate.
			record.set('date', date.getValue());	
		}		
	}
	
	/**
	 * Default jobs will be pot, fertilizer and soil.
	 */
	function addDefaultJobs()		
	{
		addJob(8);
		addJob(9);
		addJob(2);
		addJob(12);		
	}

	/**
	 * When a job is selected load the materials and labors.
	 */
	function loadData()
	{
		jobTypeChanged = true;
		
		var rows = grid.getSelectionModel().getSelections();
		
		loadMaterials(false);
		loadLabors(false);
	}	
	
	/**
	 * When a pending job is selected load the materials and labors.
	 */
	function loadPendingData()
	{
		jobTypeChanged = true;
		
		loadPendingMaterials(false);
		loadPendingLabors(false);
	}
	
	/**
	 * Load the selected template
	 */
	function loadTemplate()
	{
		dsJob.load({params: 
		{
			template_id: template.getValue(),
			completed: 1
		}});
		
		dsPendingJob.load({params: 
		{
			template_id: template.getValue(),
			completed: 0
		}});
		
		var record = dsTemplate.getById(template.getValue());
		
		plantName.setValue(record.get('plant'));
		block.setValue(record.get('block_id'));
		size.setValue(record.get('size_id'));
		days.setValue(record.get('days'));
		qty.setValue(record.get('qty'));
		sell.setValue(record.get('sell'));
		margin.setValue(record.get('margin'));
		cost.setValue(record.get('cost'));
		profit.setValue(record.get('profit')); 
	}
	
	/**
	 * Load the materials based on the selected job.
	 * True if the function is called from the drop down.
	 * @param {boolean} material
	 */
	function loadMaterials(material)
	{
		if (material) 
		{
			var rows = grid.getSelectionModel().getSelections();
			
			if (rows.length > 0)
				loadMaterialsByJob(rows[0].get('id_job'));
		}
		else 
			loadMaterialsByJob(jobType.getValue());
	}
	
	/**
	 * Load the materials based on the selected job.
	 * If materia == true the load is requested from the combobox. 
	 * @param {boolean} material
	 */
	function loadPendingMaterials(material)
	{
		if (material) 
		{
			var rows = gridPendingJobs.getSelectionModel().getSelections();
			
			if (rows.length > 0) 
				loadMaterialsByJob(rows[0].get('id_job'));
		}
		else 
			loadMaterialsByJob(jobTypePending.getValue());
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
		var rows = grid.getSelectionModel().getSelections();
			
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
	 * Set the pending material and select the cost.
	 */
	function setPendingMaterial()
	{
		var rows = gridPendingJobs.getSelectionModel().getSelections();
		
		if (rows.length > 0) 
		{
			var value = materialPending.getValue();			
			
			var index = materialPending.store.find('name', value);
			var record = materialPending.store.getAt(index);
		
			if (record != undefined) 
			{
				rows[0].set('material_cost', record.get('cost'));
				rows[0].set('days', record.get('days'));
				
				//setScheduledDate(rows[0]);
			}
		}
	}

	/**
	 * Load the labors based on the selected job.
	 * True if the function is called from the dropdown.
	 * @param {boolean} labor
	 */
	function loadLabors(labor)
	{
		if (labor) 
		{
			var rows = grid.getSelectionModel().getSelections();
			
			if (rows.length > 0) 
				loadLaborsByJob(rows[0].get('id_job'));
		}
		else 
		{
			loadLaborsByJob(jobType.getValue());
		}	
	}

	/**
	 * Load the pending labors based on the selected job.
	 * @param {boolean}
	 */
	function loadPendingLabors(labor)
	{
		if (labor) 
		{
			var rows = gridPendingJobs.getSelectionModel().getSelections();
			
			if (rows.length > 0) 
				loadLaborsByJob(rows[0].get('id_job'));
		}
		else 
			loadLaborsByJob(jobTypePending.getValue());
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
		var rows = grid.getSelectionModel().getSelections();
		
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
			}	
		}
	}
	
	/**
	 * Select the labor cost.
	 */
	function setPendingLabor()
	{
		var rows = gridPendingJobs.getSelectionModel().getSelections();
			
		if (rows.length > 0) 
		{
			var value = laborPending.getValue();
			
			var index = laborPending.store.find('name', value);
			var record = laborPending.store.getAt(index);
			
			if(record != undefined)
			{
				rows[0].set('labor_cost', record.get('cost'));
				
				grid.startEditing(dsJob.indexOf(rows[0]), 4);
			}	
		}	
	}
	
	/**
	 * Add default jobs to the grid
	 * @param {int} jobId
	 */
	function addJob(jobId)
	{
		completedJob = true;
		
		var row =  new Ext.data.Record(
		{
			id:0, 
			id_job:jobId,
			material:'',
			material_cost:'',
			labor:'',
			labor_cost:'',
			date: date.getValue(),
			completed:true,
			scheduled_date:'',
			days:0,
			insert:true
		});
			
		dsJob.add(row);
		
		loadMaterialsByJob(jobId);		
	}
	
	/**
	 * Pending jobs
	 */
	function addPendingJob()
	{
		completedJob = false;
		
		var row =  new Ext.data.Record(
		{
			id:0, 
			id_job:'',
			material:'',
			material_cost:'',
			labor:'',
			labor_cost:'',
			date: new Date(),
			completed:false,
			insert:true
		});
			
		dsPendingJob.add(row);		
	}
		
	/**
	 * Calculate the cost and profit 
	 */
	function calculatePricing()
	{
		var sellValue, marginValue, costValue, profitValue;
		
		sellValue = sell.getValue();
		marginValue = margin.getValue();
		
		costValue = sellValue - (sellValue * marginValue) / 100;
		profitValue = (sellValue - costValue);
			
		cost.setValue(costValue);
		profit.setValue(profitValue);
	}
	
	/**
	 * Save the plant into the inventory
	 */
	function savePlant()
	{
		if(block.getValue() == '' || block.getValue() == undefined)
		{
			alert('Please select a block.');
			return;
		}
		
		if(qty.getValue() == '')
		{
			alert('Please enter a qty.');
			return;
		}
		
		if(size.getValue() == '' || size.getValue() == undefined)
		{
			alert('Please select a size.');
			return;
		}
		
		if(plantName.getRawValue() == '')
		{
			alert('Please enter a name for the plant.');
			return;
		}
		
		if(date.getValue() == '' || date.getValue() == undefined)
		{
			alert('Please enter the date.');
			return;
		}
			
		applyLaborCost();
					
	    /*Ext.MessageBox.show(
	    {
	       title:'Save Plant',
	       msg: 'Do you want to save this plant?',
	       buttons: Ext.MessageBox.YESNOCANCEL, 
	       fn: function(btn)
		   {
	   			if(btn == 'yes')  /// proceed to save
				{
					jsonData = "";
					
					for(i = 0 ;i < dsJob.getCount(); i++ )
					{
						record = dsJob.getAt(i);
						
						if(record.data.insert || record.dirty) 
							jsonData += Ext.util.JSON.encode(record.data) + ",";
					} 
					
					for(i = 0 ;i < dsPendingJob.getCount(); i++ )
					{
						record = dsPendingJob.getAt(i);
						
						if(record.data.insert || record.dirty) 
							jsonData += Ext.util.JSON.encode(record.data) + ",";
					} 
					 
					if (jsonData.length > 0) 
						jsonData = "[" + jsonData.substring(0, jsonData.length - 1) + "]";

					generalForm.submit(
					{
						waitMsg: 'Saving the plant, please wait...',
						url:	"php/save_plant.php",
						params:{
									gridData	:	jsonData,
									date	:	date.getRawValue(),
									name	:	plantName.getRawValue(),
									block	:	block.getValue(),
									size	:	size.getValue(),
									days	:	days.getValue(),				
									qty		:	qty.getValue(),
									sell	:	sell.getValue(),
									margin	:	margin.getValue(),
									budget	:	cost.getValue(),
									profit	:	profit.getValue(),
									task	:	'save'  
								}, 
						success:function(form, action) 
						{
							document.location = "/plants/add_plant.php";
						},
						failure: function(form, action) 
						{
							alert('Error processing the action.');
						}
					});
				}
			},
	       icon: Ext.MessageBox.QUESTION
	   });*/
	}

	/**
	 * Save the plant template
	 */
	function saveTemplate()
	{
		if(template.getRawValue() == '')
		{
			alert('Please enter the template name.');
			return;
		}
		
		if(plantName.getRawValue() == '')
		{
			alert('Please enter the plant name.');
			return;
		}
		
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
					
					var validRows = 0;
					
					for(i = 0 ;i < dsJob.getCount(); i++ )
					{
						record = dsJob.getAt(i);
						
						if(Math.floor(record.get('id_job')) > 0)
						{
							jsonData += Ext.util.JSON.encode(record.data) + ",";
							++validRows;							
						}	
					} 
					
					for(i = 0 ;i < dsPendingJob.getCount(); i++ )
					{
						record = dsPendingJob.getAt(i);
						
						if (Math.floor(record.get('id_job')) > 0) 
						{
							jsonData += Ext.util.JSON.encode(record.data) + ",";
							++validRows;
						}
					} 
					 
					if(validRows == 0)
					{
						alert('Please add the jobs.');
						return;
					}
					
					if (jsonData.length > 0) 
						jsonData = "[" + jsonData.substring(0, jsonData.length - 1) + "]";

					generalForm.submit(
					{
						waitMsg: 'Saving the plant, please wait...',
						url:	"php/save_template.php",
						params:{
									data	:	jsonData,									
									name	:	plantName.getRawValue(),
									size	:	size.getValue(),
									days	:	days.getValue(),				
									sell	:	sell.getValue(),
									margin	:	margin.getValue(),
									budget	:	cost.getValue(),
									profit	:	profit.getValue(),
									template: 	template.getRawValue(),
									template_id: template.getValue()
						}, 
						success:function(form, action) 
						{
							document.location = "/plants/add_plant.php";							
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
		var rows = grid.getSelectionModel().getSelections();
			
		if (rows.length > 0) 
			dsJob.remove(rows[0]);		
		else
			Ext.MessageBox.alert('Status', 'Please select a row to delete!');
	}
 
 	/**
	 * Delete selected pending jobs
	 */
	function deletePendingJob()
	{
		var rows = gridPendingJobs.getSelectionModel().getSelections();
			
		if (rows.length > 0) 
			dsPendingJob.remove(rows[0]);		
		else
			Ext.MessageBox.alert('Status', 'Please select a row to delete!');
	}
	
	/**
	 * When the user select a size automatically load the corresponding labors for the jobs.
	 */
	function loadJobLabors()
	{
		jobTypeChanged = false;
		
		sizeChanged = true;
		
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
		
		loadMaterialsByJob(8);
		
		var r = dsSize.getById(size.getValue());
		
		sell.setValue(r.get('default_price'));
		calculatePricing();
	}
	
	/**
	 * When  load select the proper material for the current row only if.
	 */
	function selectProperMaterial()
	{
		var rows = null, record = null, row = null, material = "";
		var selectedSize = size.getRawValue();
		
		for (var j = 0; j < dsJob.getCount(); j++) 
		{
			record = dsJob.getAt(j);
			
			if(record.data.id_job == 8)
				for (var i = 0; i < dsMaterial.getCount(); i++) 
				{
					row = dsMaterial.getAt(i);
					material = row.data.name;
					
					if (material.toString().indexOf(selectedSize) != -1 && selectedSize != "") 
					{
						record.set('material', material);
						record.set('material_cost', row.data.cost);
						record.set('days', row.data.days);
						
						setScheduledDate(record);
						break;
					}
				}
		}
		
		for (var j = 0; j < dsPendingJob.getCount(); j++) 
		{
			record = dsPendingJob.getAt(j);
		
			if(record.data.id_job == 8)
				for (var i = 0; i < dsMaterial.getCount(); i++) 
				{
					row = dsMaterial.getAt(i);
					material = row.data.name;
					
					if (material.toString().indexOf(selectedSize) != -1  && selectedSize != "") 
					{
						record.set('material', material);
						record.set('material_cost', row.data.cost);
						record.set('days', row.data.days);
						
						setScheduledDate(record);
						break;
					}
				}
		}
		
		if(completedJob)
			rows = grid.getSelectionModel().getSelections();
		else
			rows = gridPendingJobs.getSelectionModel().getSelections();
		
		if(rows.length > 0)
		{	
			var jobId = (jobTypeChanged ? (completedJob ? jobType.getValue() : jobTypePending.getValue()) : rows[0].get('id_job'));
			
			for (var i = 0; i < dsMaterial.getCount(); i++) 
			{
				record = dsMaterial.getAt(i);
				material = record.data.name;
				
				if (jobId == 8 && material.toString().indexOf(selectedSize) != -1 && selectedSize != "") 
				{
					rows[0].set('material', material);
					rows[0].set('material_cost', record.data.cost);
					rows[0].set('days', record.data.days);
					
					setScheduledDate(rows[0]);
					
					return;
				}
			}
			
			if (jobId == 8 || jobTypeChanged) 
			{
				rows[0].set('material', '');
				rows[0].set('material_cost', 0);
				rows[0].set('days', 0);
				
				setScheduledDate(rows[0]);
			}	
		}
		
		materialChanged = false;
				
		if(sizeChanged)
		{
			days.focus();
			sizeChanged = false;
		}
	}

	/**
	 * When labors load select the proper material for the current row only if.
	 */
	function selectProperLabor()
	{
		var rows = null;
		
		if(completedJob)
			rows = grid.getSelectionModel().getSelections();
		else
			rows = gridPendingJobs.getSelectionModel().getSelections();
		
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
	 * Assign loaded labors based on jobId and size
	 */
	function assignLabors()
	{
		var count = 0, job = null, index = 0, record = null;
		
		//assign values
		count = dsJobLabor.getCount();
		
		for (var i = 0; i < count; i++)
		{
			record = dsJobLabor.getAt(i);
			
			index = dsJob.find('id_job', record.data.id_job);
			
			if (index >= 0) 
			{
				job = dsJob.getAt(index);
				
				job.set('labor', record.data.labor);
				job.set('labor_cost', record.data.cost);
			}
			
			index = dsPendingJob.find('id_job', record.data.id_job);
			
			if (index >= 0) 
			{
				job = dsPendingJob.getAt(index);
				
				job.set('labor', record.data.labor);
				job.set('labor_cost', record.data.cost);
				
				gridPendingJobs.startEditing(index, 4);
			}
		} 
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
		var rows = grid.getSelectionModel().getSelections();
	
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
	
	/**Apply labor cost**/
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

		employeeGrid.on('cellclick', calculateCost);
				
		formPanelLaborCost = new Ext.form.FormPanel(
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
		
		formPanelLaborCost.on("actioncomplete", function(t, a) 
		{			
			alert('Your changes were saved!');
			
			formPanelLaborCost.getForm().reset();
		});
	
		dialog = new Ext.Window({
		    title: 'Apply labor cost',
		    width: 500,
		    height:400,
			layout: 'fit',
		    plain:true,
			closeAction :'hide',
			modal:true,
		    bodyStyle:'padding:5px;',
		    buttonAlign:'center',
		    items: formPanelLaborCost,
		    buttons: [
			{
	            text: 'Save',
				handler	:	function()
				{
					if(pieceWorkType.getValue() == 1) //Per hour
					{
						var costPerPlant = getCostPerPlant();
						
						for(var i = 0; i < dsJob.getCount(); i++)
							dsJob.getAt(i).set('labor_cost', costPerPlant);
					}
								
					var rows = employeeGrid.getSelectionModel().getSelections();
					var pieceWorkData = "";
					
					for(i = 0; i < rows.length; i++) 
					{
						rows[i].data.ticket = 0;
						rows[i].data.insert = true;
						
						pieceWorkData += Ext.util.JSON.encode(rows[i].data) + ",";
					}
					
					if(pieceWorkData.length > 0)
						pieceWorkData = "[" + pieceWorkData.substring(0, pieceWorkData.length - 1) + "]";
					
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
								
								for(i = 0 ;i < dsJob.getCount(); i++ )
								{
									record = dsJob.getAt(i);
									
									if(record.data.insert || record.dirty) 
										jsonData += Ext.util.JSON.encode(record.data) + ",";
								} 
								
								for(i = 0 ;i < dsPendingJob.getCount(); i++ )
								{
									record = dsPendingJob.getAt(i);
									
									if(record.data.insert || record.dirty) 
										jsonData += Ext.util.JSON.encode(record.data) + ",";
								} 
								 
								if (jsonData.length > 0) 
									jsonData = "[" + jsonData.substring(0, jsonData.length - 1) + "]";
			
								generalForm.submit(
								{
									waitMsg: 'Saving the plant, please wait...',
									url:	"php/save_plant.php",									
									params:{
												gridData	:	jsonData,
												date	:	date.getRawValue(),
												name	:	plantName.getRawValue(),
												block	:	block.getValue(),
												size	:	size.getValue(),
												days	:	days.getValue(),				
												qty		:	qty.getValue(),
												sell	:	sell.getValue(),
												margin	:	margin.getValue(),
												budget	:	cost.getValue(),
												profit	:	profit.getValue(),
												task	:	'save',
												pieceWorkData : pieceWorkData, 
												piece_work: pieceWorkType.getValue(), 
												labor_cost: getCostPerPlant()  
											}, 
									success:function(form, action) 
									{
										document.location = "/plants/add_plant.php";
									},
									failure: function(form, action) 
									{
										alert('Error processing the action.');
									}
								});
							}
						},
				       icon: Ext.MessageBox.QUESTION
				   });
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
		formPanelLaborCost.getForm().reset();
	}

	function getCostPerPlant()
	{
		var qtyValue = qty.getValue(), totalCostValue = totalCost.getValue();
			
		return (qtyValue > 0)? (totalCostValue / qtyValue) : 0;				
	}	
	
	function calculateCost(selectionModel)
	{
		setTotalCost();
		
		var record = null;
		var count = 0;
		var cost = 0;		
		var totalCostValue = totalCost.getValue();
		var rows = employeeGrid.getSelectionModel().getSelections();
		var qtyValue = qty.getValue();
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
				
			costPerPlant = (qty > 0)? (totalCostValue/qty) : 0;
			
			for (var i = 0; i < rows.length; i++) 
				rows[i].set('cost', rows[i].get('salary') * hoursValue);
		}							
	}
	
	function setTotalCost()
	{
		var total = 0;
		var qtyValue = parseInt(qty.getValue());
		var auxLaborCost = 0;
		
		if (pieceWorkType.getValue() == 0) 
			for (var i = 0; i < dsJob.getCount(); i++)
			{
				auxLaborCost = dsJob.getAt(i).data.labor_cost;
				
				if(auxLaborCost != "")
					total += auxLaborCost * qtyValue;
			} 
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
	
	function applyLaborCost()
	{
		if(formPanelLaborCost == null)
			createDialog();	
	
		setTotalCost();
		
		pieceWorkType.setValue(0);
		
		dialog.show();
	}	
});