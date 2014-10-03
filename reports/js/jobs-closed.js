/**
 * @author Greivin
 */
var dsData = null;

function formatDate(value)
{
    return value ? value.dateFormat('M d, Y') : '';
}

function formatNumber(v)
{ // override Ext.util.usMoney
    v = Ext.num(v, 0); // ensure v is a valid numeric value, otherwise use 0 as a base (fixes $NaN.00 appearing in summaryRow when no records exist)
    v = (Math.round((v - 0) * 100)) / 100;
    v = (v == Math.floor(v)) ? v + "" : ((v * 10 == Math.floor(v * 10)) ? v + "" : v);
    v = String(v);
    var ps = v.split('.');
    var whole = ps[0];
    var sub = ps[1] ? '.' + ps[1] : '';
    var r = /(\d+)(\d{3})/;
    while (r.test(whole)) {
        whole = whole.replace(r, '$1' + ',' + '$2');
    }
    v = whole + sub;
    if (v.charAt(0) == '-') {
        return v.substr(1);
    }
    return v;
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
		
		dsJobType.sort("name", "ASC");
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
		
		dsMaterial.sort("id", "ASC");	
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
				{name:'full_name', type:'string'}				
			]
        })	    
	});
	
	dsEmployee.on('load', function()
	{
		dsEmployee.add(new Ext.data.Record(
		{
			id: 0,
			full_name: 'All'
		}));	
		
		dsEmployee.sort("name", "ASC");
	});
	
	//Employees
    var dsEmployeeGrid = new Ext.data.Store(
	{
		proxy: new Ext.data.HttpProxy({url:'../employees/php/employees_data.php', method:'post'}),
        reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
                {name:'id', type:'int'}, 
				{name:'full_name', type:'string'}				
			]
        })	    
	});
	
	dsEmployeeGrid.load();

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
			name: '0'
		}));
		
		dsBlock.sort("name", "ASC");
	});
	
	//Size
    var dsSize = new Ext.data.Store(
	{
		proxy: new Ext.data.HttpProxy({url:'/sizes/php/sizes_data.php', method:'post'}),
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
		dsSize.add(new Ext.data.Record(
		{
			id: 0,
			name: 'All'
		}));
		
		dsSize.sort("id", "ASC");	
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
            id: 'plant',
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
		
		dsPlant.sort("plant", "ASC");
	});
	
	//Plants
    var dsPlant2 = new Ext.data.Store(
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
    var dsDate = new Ext.data.Store(
	{
		url: 'php/dates.php',
    	method:'post',
        reader: new Ext.data.JsonReader(
		{
            root: 'data',
            id: 'label',
            fields: [
                {name:'id', type:'int'}, 
				{name:'label', type:'string'},
				{name:'from', type:'date', dateFormat:'Y-m-d'},
				{name:'to', type:'date', dateFormat:'Y-m-d'}
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
	
	//create the Data Store
    var dsData = new Ext.data.GroupingStore(
	{
		//TODO 		
		proxy: new Ext.data.HttpProxy({url:'php/jobs_closed_data.php?status=Closed', method:'post'}),
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
				{name: 'employee_id'},				
				{name: 'employee'},
				{name: 'status'},
				{name: 'size'},
				{name: 'qty', type:'int'},
				{name: 'completed_date', type: 'date', dateFormat: 'Y-m-d'},
    			{name: 'date', type: 'date', dateFormat: 'Y-m-d'} 
			]
        }),
		sortInfo	:	{field	:	'date', direction	:	'ASC'},
		groupField	:	'job_name'
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
		mode:'local',
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
		width: 60,
        typeAhead: true,
		editable:false,
        triggerAction: 'all'
    });
	
	block.on('select', loadDataSource);
	
	var plant = new Ext.form.ComboBox(
    {
        fieldLabel: 'Plant',                        
        store: dsPlant,
        valueField:'id',
        displayField:'plant',
		width:85,
        typeAhead: true,
		editable:false,
        triggerAction: 'all'
    });
	
	plant.on('select', function()
	{
		loadDataSource();	
	});

	var size = new Ext.form.ComboBox(
    {
        fieldLabel: 'Size',                        
        store: dsSize,
        valueField:'id',
        displayField:'name',
		width: 55,
        typeAhead: true,
		editable:false,
        triggerAction: 'all'
    });
	
	size.on('select', loadDataSource);

	var date = new Ext.form.ComboBox(
	{
		store: dsDate,
        valueField:'label',
        displayField:'label',
        typeAhead: true,
		editable:false,
        mode: 'local',
		width:100,
        triggerAction: 'all'
    });
	
	date.on('select', function()
	{
		setDateRange();
		
		loadDataSource();
	});
		
	var employee = new Ext.form.ComboBox(
    {
        fieldLabel: 'Employee',                        
        store: dsEmployee,
        valueField:'id',
        displayField:'full_name',
		width:100,
        typeAhead: true,
		editable:false,
        triggerAction: 'all'
    });
	
	employee.on('select', function()
	{
		endDateField.setDate(new Date());
		
		loadDataSource();
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
		width:90,
		disabled:true
	});
	
	endDateField.on('change', loadByDateRange);
	
	var employeeEditor = new Ext.form.ComboBox(
    {
        fieldLabel: 'Employee',                        
        store: dsEmployeeGrid,
        valueField:'id',
        displayField:'full_name',
	    typeAhead: true,
		editable:false,
        triggerAction: 'all'
    });
	
	var plantId = new Ext.form.ComboBox(
    {
        store: dsPlant2,
        valueField:'id',
        displayField:'id',
		width:65,
		typeAhead: true,
		editable:false,
        triggerAction: 'all'
    });
	
	plantId.on('select', function()
	{
		loadDataSource();	
	});
	
    var pendingJobColumnModel = new Ext.grid.ColumnModel([
	{
		header		:	'Block', 
		dataIndex	:	'block',
		align: 'center',
		width: 60,
		sortable	:	true
	},
	{
		header		:	'Plant Id',
		dataIndex	:	'inventory_id',
		align: 'center',
		width:65,
		sortable	:	true		
	},
	{
		header		:	'Size', 
		dataIndex	:	'size',
		align: 'center',
		width: 55,
		sortable	:	true
	},
	{
		header		:	'Plant',
		dataIndex	:	'plant',
		width:85,
		sortable	:	true
	},
	{
		header		:	'Qty', 
		dataIndex	:	'qty',
		align: 'right',
		width: 55,
		sortable	:	true,
		renderer: formatNumber,
		summaryType:'sum'
	},
	{
		header		:	'Closed Date',
		dataIndex	:	'completed_date',
		width: 100,
		align:'center',
		renderer	:	Ext.util.Format.dateRenderer('m/d/y'),
		sortable	:	true 
	},
	{
		header		:	'Material',
		dataIndex	:	'material_name',
		width:70,
		align:'center',
		sortable	:	true
	},
	{
		header		:	'Job Name ',
		dataIndex	:	'job_name',
		width:100,
		sortable	:	true
	},
	{
		header		:	'Assigned To', 
		dataIndex	:	'employee_id',
		width: 100,		
		hidden: true, 
		sortable	:	true,
		renderer: function(data) 
		{
			var record = dsEmployeeGrid.getById(data);
			
			if (record != undefined )
				return record.data.full_name;
		
			return 'Select one';					
		}
	}]);

	var pendingJobGrouping = new Ext.grid.GroupSummary();	
	var pendingJobSummary = new Ext.ux.grid.GridSummary();
	
	//Pending jobs
	var grid = new Ext.grid.GridPanel( 
	{
		region:'center',
		store :dsData,
		cm:pendingJobColumnModel,
		stripeRows :true,
		selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),
		frame:true,
		loadMask:true,
		plugins		: [pendingJobGrouping, pendingJobSummary],
    	view	:	new Ext.grid.GroupingView(
		{
				forceFit		:	false,
				showGroupName	:	false,
				startCollapsed	:	false,
				enableGrouping 	:	false,
				hideGroupedColumn	:	false,				
				// custom grouping text template to display the number of items per group
		        groupTextTpl: '{text}&nbsp;({[values.rs.length]})'				
		}),

		clicksToEdit:1,
		viewConfig: 
		{
            forceFit:false
        },			
		title :'Jobs Closed',		
		tbar: new Ext.Panel({
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
						'From:&nbsp;&nbsp;&nbsp;',
						startDateField,
						'&nbsp;To:&nbsp;&nbsp;&nbsp;&nbsp;',
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
						}	
					]
				},
				{
					xtype: 'toolbar',
					items: [
						block,
						plantId,
						size,
						//'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',						
						plant,
						'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
						date,
						material,
						jobType
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
		grid
		]
	});

	dsDate.on('load', function()
	{
		date.setValue('This Week');
		setDateRange();
		loadDataSource();	
	});
	
	dsEmployeeGrid.on('load', function()
	{
		dsDate.load();	
	});
	
	dsEmployeeGrid.load();
	    
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
					plant_id:plantId.getValue(),
					plant:plant.getRawValue(),
					material_id: material.getValue(),
					size_id:size.getValue(),
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
					job_id:jobType.getValue(),
					block_id:block.getValue(),
					plant_id:plantId.getValue(),
					size_id:size.getValue(),
					plant:plant.getRawValue(),				
					material_id: material.getValue()
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
	
	function setDateRange()
	{
		var record = dsDate.getById(date.getValue());
		
		startDateField.setValue(record.get('from'));	
		endDateField.setValue(record.get('to'));
	}
	
	function onRangeToogle(item, pressed)
	{
        startDateField.setDisabled(!pressed);
		endDateField.setDisabled(!pressed);
    }
	
	function getFormattedDate(date)
	{
		if(date != null)
		{
			var day = date.getDate();
			var month = (date.getMonth() + 1);
			
			return date.getFullYear() + '-' + (month > 9 ? month : '0' + month) + '-' + (day > 9 ? day : '0' + day);	
		}
		else
			return '';
	}
});