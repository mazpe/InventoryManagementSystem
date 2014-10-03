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
		proxy: new Ext.data.HttpProxy({url:'php/plant_data.php?status=Completed&completed=1', method:'post'}),
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
        triggerAction: 'all'
    });

	jobType.on('select', loadDataSource);
	
	var block = new Ext.form.ComboBox(
    {
        fieldLabel: 'Blocks',                        
        store: dsBlock,
        valueField:'id',
        displayField:'name',
		anchor		: '95%',
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
		anchor		: '95%',
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
	
    var pendingJobColumnModel = new Ext.grid.ColumnModel([
	{
		header		:	'Job Name ',
		dataIndex	:	'job_name',
		sortable	:	true
	},
	{
		header		:	'Completed Date',
		dataIndex	:	'date',		
		renderer	:	Ext.util.Format.dateRenderer('m/d/Y'),
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
		dataIndex	:	'employee',
		sortable	:	true
	} 
	]);

	var pendingJobGrouping = new Ext.grid.GroupSummary();	
	//var pendingJobSummary = new Ext.ux.grid.GridSummary();
	
	//Pending jobs
	var grid = new Ext.grid.EditorGridPanel( 
	{
		region:'center',
		store :dsData,
		frame:true, 
		cm:pendingJobColumnModel,
		stripeRows :true,
		loadMask:true,
		selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),
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
		title :'Completed Jobs',
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

    dsEmployee.on('load', loadDataSource);
	dsEmployee.load();
    
    function loadDataSource()	
    {	
    	dsData.load(
		{
			params:
			{
				date_range:date.getValue(),
				job_id:jobType.getValue(),
				block_id:block.getValue(),
				plant_id:plant.getValue()
			}
		});
	}
});