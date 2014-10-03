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
		
		dsEmployee.sort("full_name", "ASC");
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
	
	//create the Data Store
    var dsData = new Ext.data.GroupingStore(
	{
		//TODO 		
		proxy: new Ext.data.HttpProxy({url:'php/piece_work_data.php', method:'post'}),
		reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
   				{name: 'id', type: 'int'},
				{name: 'full_name'},
    			{name: 'plant', type: 'string'},
    			{name: 'job', type:'string'},
				{name: 'qty', type:'int'},
				{name: 'cost', type:'float'},
    			{name: 'completed_date', type: 'date', dateFormat: 'Y-m-d'} 
			]
        }),
		sortInfo	:	{field	:	'full_name', direction	:	'ASC'},
		groupField	:	'full_name'
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
		loadDataSource();
	});

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
		endDateField.setValue(new Date());
		
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
	
	var selectionModel = new Ext.grid.CheckboxSelectionModel();
	
    var pendingJobColumnModel = new Ext.grid.ColumnModel([
	{
		header		:	'Name', 
		dataIndex	:	'full_name',		
		width: 100,
		sortable	:	true
	},
	{
		header		:	'Job Name ',
		dataIndex	:	'job',
		width:100,
		sortable	:	true
	},
	{
		header		:	'Date',
		dataIndex	:	'completed_date',
		width: 100,
		align:'center',
		renderer	:	Ext.util.Format.dateRenderer('m/d/y'),
		sortable	:	true 
	},
	{
		header		:	'Qty', 
		dataIndex	:	'qty',
		align: 'right',
		width: 55,
		renderer:formatNumber,
		sortable	:	true,		
		summaryType:'sum'
	},
	{
		header		:	'Plant',
		dataIndex	:	'plant',
		width:85,
		sortable	:	true
	},
	{
		header		:	'Amount', 
		dataIndex	:	'cost',
		align: 'right',
		width: 55,
		renderer:'usMoney',
		sortable	:	true,		
		summaryType:'sum'
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
		//selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),
		selModel:selectionModel,
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
		title :'Piece Work',		
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
						employee, 
						jobType, 
						date,
						'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;',
						plant
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
		date.setValue('Past Due');
		setDateRange();
		loadDataSource();	
	});
	
	dsDate.load();
	    
    function loadDataSource()	
    {	
		if(startDateField.disabled == false)
			dsData.load(
			{
				params:
				{
					date_range:date.getValue(),
					job_id:jobType.getValue(),
					employee_id:employee.getValue(),
					plant:plant.getRawValue(),
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
					employee_id:employee.getValue(),
					job_id:jobType.getValue(),
					plant:plant.getRawValue()
				}
			});
	}
	
	
	function loadByDateRange()
	{
		if(startDateField.getValue() != '' && endDateField.getValue() != '')
			loadDataSource();	
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
		if(date != null && date != "")
		{
			var day = date.getDate();			
			var month = (date.getMonth() + 1);
			
			return date.getFullYear() + '-' + (month > 9 ? month : '0' + month) + '-' + (day > 9 ? day : '0' + day);	
		}
		else
			return '';
	}
});