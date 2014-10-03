/**
 * @author Greivin
 */
var dsData = null;
var field = null;
var order = null;

function formatDate(value)
{
    return value ? value.dateFormat('M d, Y') : '';
}

function formatNumber(v)
{ 
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
			name: '0'
		}));
		
		dsBlock.sort("name", "ASC");
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
		width:90,
        triggerAction: 'all'
    });
	
	date.on('select', loadDataSource);
		
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
	
	var plantId = new Ext.form.ComboBox(
    {
        store: dsPlant2,
        valueField:'id',
        displayField:'id',
		width:55,
		typeAhead: true,
		editable:false,
        triggerAction: 'all'
    });
	
	plantId.on('select', function()
	{
		loadDataSource();	
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
		
    var pendingJobColumnModel = new Ext.grid.ColumnModel([
	{
		header		:	'Block', 
		dataIndex	:	'block',
		align		: 	'center',		
		width		:   55,
		sortable	:	true
	},
	{
		header		:	'Plant Id',
		dataIndex	:	'id',
		width		:   55,
		align		: 	'center',		
		sortable	:	true 
	},
	{
		header		:	'Size',
		dataIndex	:	'size',
		align		: 	'center',
		width		:   55,
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
		renderer: formatNumber,
		width		:   50,
		sortable	:	true
	},
	{
		header		:	'Date Planted', 
		dataIndex	:	'date_planted',
		renderer	:	Ext.util.Format.dateRenderer('m/d/y'),
		align		: 	'center',
		width		:   90,
		sortable	:	true
	},
	{
		header		:	'Fertilizer',
		dataIndex	:	'fert_mat',
		align		:	'center',
		width		:   85,
		sortable	:	true
	},
	{
		header		:	'Fertitilizer Date', 
		dataIndex	:	'fert_date',
		renderer	:	Ext.util.Format.dateRenderer('m/d/y'),
		align		: 	'center',
		width		:   110,
		sortable	:	true
	},
	{
		header		:	'Herbicides',
		dataIndex	:	'herb_mat',
		align		:	'center',
		width		:   85,
		sortable	:	true
	},
	{
		header		:	'Herbicide Date', 
		dataIndex	:	'herb_date',
		renderer	:	Ext.util.Format.dateRenderer('m/d/y'),
		align		:	'center',
		width		:   110,
		sortable	:	true
	},
	{
		header		:	'Weed', 
		dataIndex	:	'weed',
		renderer	:	Ext.util.Format.dateRenderer('m/d/y'),
		align		: 	'center',
		width		:   60,
		sortable	:	true
	},
	{
		header		:	'Cut', 
		dataIndex	:	'cut',
		renderer	:	Ext.util.Format.dateRenderer('m/d/y'),
		align		: 	'center',
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
		tbar: new Ext.Panel({
			items: [
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
						},'-',
						{
							text	:	'Print',
							icon	: '/images/application/print.png',
							cls		: 'x-btn-text-icon',
							handler	:	function()
							{	
								if(startDateField.disabled == true && endDateField.disabled == true)
									url = "/reports/print/last-done-report.php?status=Closed&completed=1"  + "&sort=" + field + "&dir=" + order + "&block=" + block.getValue() + "&plant_id=" + plantId.getValue() + "&plant=" + plant.getRawValue() + "&size="+ size.getValue() + "&date_range=" + date.getValue(); 
								else
									url = "/reports/print/last-done-report.php?status=Closed&completed=1"  + "&sort=" + field + "&dir=" + order + "&block=" + block.getValue() + "&plant_id=" + plantId.getValue() + "&plant=" + plant.getRawValue() + "&size="+ size.getValue() + "&start=" + getFormattedDate(startDateField.getValue()) + "&end=" + getFormattedDate(endDateField.getValue());
									 
								popUp(url);
							}
						},'-'						
					]
				},
				{
					xtype: 'toolbar',
					items: [
						block,
						plantId,
						size,
						plant, 						
						'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',						
						date/*,
						material,						 
						{
							text:'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
						}*/
					]
				}]
		})			
	});

	grid.on('celldblclick', function()
    {
        var rows = grid.getSelectionModel().getSelections();
        var id = "";
        if (rows.length > 0) 
        {
            id = rows[0].get('id');
            document.location = "/plants/view_plant.php?id=" + id;
        }
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

	dsData.load();
	
    function loadDataSource()	
    {	
		if(startDateField.disabled == false)
		dsData.load(
		{
			params:
			{
				date_range:date.getValue(),				
				block_id:block.getValue(),
				plant_id:plantId.getValue(),
				plant:plant.getRawValue(),
				size_id:size.getValue(),
				//material_id: material.getValue(),
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
				block_id:block.getValue(),
				size_id:size.getValue(),
				plant_id:plantId.getValue(),
				plant:plant.getRawValue()				
				/*material_id: material.getValue()*/
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
	
	function popUp(url) 
	{
		day = new Date();
		id = day.getTime();
		
		eval("page" + id + " = window.open('" + url + "', '" + id + "', 'toolbar=0, location=0, scrollbars=1 lbar=no, statusbar=0, addressbar=0, directories=no, menubar=yes, status=no, resizable=0, width=900,height=500,left = 390,top = 150');");
	}
});