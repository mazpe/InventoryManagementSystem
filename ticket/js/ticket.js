/**
 * @author Greivin
 */
var dsData   = null;

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
	var vendor = null;
	
	var gridForm = new Ext.form.BasicForm(
		Ext.get("general-form"),
		{			
		}
	);	
	
	// create the Data Store
    dsData = new Ext.data.Store(
	{
        url: "/ticket/php/ticket_data.php",
    	method:'post',
        reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
                {name: 'id', type:'int'},
	    		{name: 'created', type:'date', dateFormat: 'Y-m-d'},		
				{name: 'status'},
				{name: 'job_type'},
				{name: 'job_count', type:'int'},
			]
        }),

        // turn on remote sorting
        remoteSort: true
    });
	
    dsData.setDefaultSort('id', 'asc');

	// the column model has information about grid columns
    // dataIndex maps the column to the specific data field in
    // the data store
    
    var cm = new Ext.grid.ColumnModel([
    	new Ext.grid.RowNumberer(),
		{		  
           header: "Ticket Id",
           dataIndex: 'id'          
        },
		{
			header: 'Created',
			dataIndex: 'created',	
			renderer:	Ext.util.Format.dateRenderer('m/d/y'),
			align:'center'
		},
		{
			header:'Status',
			dataIndex:'status',
			editor: new Ext.form.ComboBox(
			{
		        store: new Ext.data.SimpleStore(
				{
		    		fields: ['status', 'id'],
					data : [['Open','Open'],['Closed','Closed']]
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
           header: "Job Type",
           dataIndex: 'job_type'          
        },
		{		  
           header: "Job Count",
           dataIndex: 'job_count',
		   align:'center'          
        }
    ]);

    // by default columns are sortable
    cm.defaultSortable = true;

	var grid = new Ext.grid.GridPanel(
	{
		region:'center',
        frame:true,
        title:'Ticket',
        store: dsData,
        cm: cm,
        trackMouseOver:true,
        selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),        
		stripeRows: true,	
        loadMask: true,
        viewConfig: 
		{
            forceFit: false
        },       
        tbar:[
		{
			text	:	'Delete',
			icon: '/ticket/images/delete.png',
			cls: 'x-btn-text-icon',
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
									url:"php/process_ticket.php",										
									params:{data:jsonData},
									success:function(form, action) 
									{
										alert('Your changes were saved!');
										
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
		},
		{
			text	:	'Refresh', 
			icon	: 	'/images/application/refresh.png',				
			cls		: 	'x-btn-text-icon',			
			handler	:   loadDataSource
		}]
    });
    
	grid.on('celldblclick', function()
    {
        var rows = grid.getSelectionModel().getSelections();
        var id = "";
        if (rows.length > 0) 
        {
            id = rows[0].get('id');
            document.location = "/reports/jobs-ticket.php?ticket=" + id;
        }
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

    // trigger the data store load
	dsData.load();
	
    function loadDataSource()	
    {	
    	dsData.load();
	}
});