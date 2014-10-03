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
		proxy: new Ext.data.HttpProxy({url:'php/last_done_report_data.php?status=Closed&completed=1', method:'post'}),
		reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
   				{name: 'id', type: 'int'},
				{name: 'block', type:'int'},
    			{name: 'inventory_id', type: 'int'},
				{name: 'size'},
				{name: 'plant', type:'string'},
    			{name: 'qty', type: 'float'},
				{name: 'date_planted', type: 'date', dateFormat: 'Y-m-d'},
				{name: 'fert_mat'},
				{name: 'fert_date', type: 'date', dateFormat: 'Y-m-d'}, 
				{name: 'herb_mat'},
				{name: 'herb_date', type: 'date', dateFormat: 'Y-m-d'},
				{name: 'weed', type: 'date', dateFormat: 'Y-m-d'},
				{name: 'cut', type: 'date', dateFormat: 'Y-m-d'},
				{name: 'spray', type: 'date', dateFormat: 'Y-m-d'},
				{name: 'date', type: 'date', dateFormat: 'Y-m-d'} 
			]
        }),
		sortInfo	:	{field	:	'block', direction	:	'ASC'}	
    });

	
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
		header		:	'Block', 
		dataIndex	:	'block',
		align		: 	'right',		
		width		:   60,
		sortable	:	true
	},
	{
		header		:	'Plant Id',
		dataIndex	:	'id',
		width		:   60,
		align		: 	'right',		
		sortable	:	true 
	},
	{
		header		:	'Size',
		dataIndex	:	'size',
		align		: 	'right',
		width		:   50,
		sortable	:	true
	},	
	{
		header		:	'Plant',
		dataIndex	:	'plant',
		width		:   100,
		sortable	:	true
	},
	{
		header		:	'Qty', 
		dataIndex	:	'qty',
		align		: 	'right',
		width		:   60,
		sortable	:	true
	},
	{
		header		:	'Date Planted', 
		dataIndex	:	'date_planted',
		renderer	:	Ext.util.Format.dateRenderer('m/d/y'),
		align		: 	'right',
		width		:   90,
		sortable	:	true
	},
	{
		header		:	'Fertilizer material',
		dataIndex	:	'fert_mat',
		align		:	'right',
		width		:   110,
		sortable	:	true
	},
	{
		header		:	'Fertitilizer Date', 
		dataIndex	:	'fert_date',
		renderer	:	Ext.util.Format.dateRenderer('m/d/y'),
		align		: 	'right',
		width		:   110,
		sortable	:	true
	},
	{
		header		:	'Herbicides material',
		dataIndex	:	'herb_mat',
		align		:	'right',
		width		:   120,
		sortable	:	true
	},
	{
		header		:	'Herbicide Date', 
		dataIndex	:	'herb_date',
		renderer	:	Ext.util.Format.dateRenderer('m/d/y'),
		align		:	'right',
		width		:   110,
		sortable	:	true
	},
	{
		header		:	'Weed', 
		dataIndex	:	'weed',
		renderer	:	Ext.util.Format.dateRenderer('m/d/y'),
		align		: 	'right',
		width		:   60,
		sortable	:	true
	},
	{
		header		:	'Cut', 
		dataIndex	:	'cut',
		renderer	:	Ext.util.Format.dateRenderer('m/d/y'),
		align		: 	'right',
		width		:  60,
		sortable	:	true
	},
	{
		header		:	'Spray', 
		dataIndex	:	'spray',
		renderer	:	Ext.util.Format.dateRenderer('m/d/y'),
		align		: 'right',
		width		:   60,
		sortable	:	true
	} 
	]);

	var pendingJobGrouping = new Ext.grid.GroupSummary();	
	
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
		clicksToEdit:1,
		viewConfig: 
		{
            forceFit: false
        },			
		title :'Last Done Report',
		tbar: [
		{
			text:'Date Range'
		},
		date,		
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
				block_id:block.getValue(),
				plant_id:plant.getValue()
			}
		});
	}
});