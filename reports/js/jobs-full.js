/**
 * @author Greivin
 */
var dsData = null;

function formatDate(value)
{
    return value ? value.dateFormat('M d, Y') : '';
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
	
	dsEmployee.load();
	
	dsEmployee.on('load', function()
	{
		dsEmployee.add(new Ext.data.Record(
		{
			id: 0,
			full_name: 'All'
		}));	
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
			name: 'All'
		}));	
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
    var dsData = new Ext.data.GroupingStore(
	{
		//TODO 		
		proxy: new Ext.data.HttpProxy({url:'php/plant_data.php?status=All', method:'post'}),
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
        typeAhead: true,
		editable:false,
		width:100,
        triggerAction: 'all'
    });

	jobType.on('select', loadDataSource);
	
	var block = new Ext.form.ComboBox(
    {
        fieldLabel: 'Blocks',                        
        store: dsBlock,
        valueField:'id',
        displayField:'name',
	    typeAhead: true,
		width:100,
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
	    typeAhead: true,
		editable:false,
        triggerAction: 'all'
    });
	
	plant.on('select', loadDataSource);

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
        triggerAction: 'all'
    });
	
	date.on('select', loadDataSource);
		
	var employee = new Ext.form.ComboBox(
    {
        fieldLabel: 'Employee',                        
        store: dsEmployee,
        valueField:'id',
        displayField:'full_name',
	    typeAhead: true,
		editable:false,
        triggerAction: 'all'
    });

	employee.on('select', loadDataSource);

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

	var status = new Ext.form.ComboBox(
	{
        store: new Ext.data.SimpleStore(
		{
    		fields: ['status', 'status'],
			data : [['All','1'],['Completed','2'],['Assigned','3'],['Pending','4']]
		}),
        valueField:'status',
        displayField:'status',
        typeAhead: true,
		editable:false,
		width:100, 
        mode: 'local',
        triggerAction: 'all'
    });
	
	status.on('select', loadDataSource);
		
	var pendingJobColumnModel = new Ext.grid.ColumnModel([
	{
		header		:	'Job Name ',
		dataIndex	:	'job_name',
		sortable	:	true
	},
	{
		header		:	'Schedule Date',
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
		header		:	'Block', 
		dataIndex	:	'block',
		sortable	:	true		
	},
	{
		header		:	'Plant Id', 
		dataIndex	:	'inventory_id',
		sortable	:	true		
	},
	{
		header		:	'Plant',
		dataIndex	:	'plant',
		sortable	:	true
	},
	{
		header		:	'Assigned To', 
		dataIndex	:	'employee_id',
		editor		:	employeeEditor,
		sortable	:	true,
		renderer: function(data) 
		{
			var record = dsEmployeeGrid.getById(data);
			
			if (record != undefined )
				return record.data.full_name;
		
			return 'Select one';					
		}
	},
	{
		header		:	'Status', 
		dataIndex	:	'status',
		sortable	:	true,
		editor		:	new Ext.form.ComboBox(
		{
                    store: new Ext.data.SimpleStore(
					{
	            		fields: ['status', 'status'],
            			data : [['Select one','1'],['Completed','2'],['Assigned','3'],['Pending','4']]
        			}),
                    valueField:'status',
                    displayField:'status',
                    typeAhead: true,
					editable:false,
                    mode: 'local',
                    triggerAction: 'all'
    	})
	} 
	]);

	var pendingJobGrouping = new Ext.grid.GroupSummary();	
	//var pendingJobSummary = new Ext.ux.grid.GridSummary();
	
	//Pending jobs
	var grid = new Ext.grid.EditorGridPanel( 
	{
		region:'center',
		frame:true,
		store :dsData,
		cm:pendingJobColumnModel,
		stripeRows :true,
		selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),
		loadMask:true, 
		autoScroll:'auto', 
		plugins		: [pendingJobGrouping],
    	view	:	new Ext.grid.GroupingView(
		{
				forceFit		:	false,
				showGroupName	:	false,
				startCollapsed	:	false,
				enableGrouping 	:	false,
				hideGroupedColumn	:	true,				
				// custom grouping text template to display the number of items per group
		        groupTextTpl: '{text}&nbsp;({[values.rs.length]})'				
		}),

		clicksToEdit:1,
		viewConfig: 
		{
            forceFit:false
        },			
		title :'Jobs Full',
		tbar: [
		{
			text:'Date Range'
		},
		date, 
		{
			text:'Jobs'
		},
		jobType,
		{
			text:'Blocks'
		}, 
		block,
		{
			text:'Plant'
		},
		plant,
		{
			text:'Employee'
		},
		employee, 
		{
			text:'Status'
		},
		status,
        {
            text: 'Save',
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
					});
				}				
				else
					alert('No changes to submit.');		
			}
        },		
		{
			text	:	'Refresh',
			handler	:	function()
			{
				loadDataSource();
			}
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

	dsData.load();
	
    function loadDataSource()	
    {	
    	dsData.load(
		{
			params:
			{
				date_range: date.getValue(),
				job_id: jobType.getValue(),
				block_id: block.getValue(),
				plant_id: plant.getValue(),
				status: status.getValue(),
				employee_id: employee.getValue(),
			}
		});
	}
});