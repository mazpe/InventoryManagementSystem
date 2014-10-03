/**
 * @author Greivin
 */
var dsVendor = null;
var dsData = null;

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
	
	dsVendor = new Ext.data.Store(
	{
		proxy: new Ext.data.HttpProxy({url:'/vendors/php/vendors_data.php', method:'post'}),
		reader: new Ext.data.JsonReader(
		{root:'data', id:'vendors'},
		[
			{name: 'id'},
			{name: 'vendor_name'}
		])
	});

	/*editor*/
	vendor = new Ext.form.ComboBox(
	{
	    store			: dsVendor, 
	    displayField	: 'vendor_name',
		valueField		: 'id',
		editable		: false,
		forceSelection 	: true,
		allowBlank		: false,
		lazyRender		: true,
		mode			: 'local',
		fieldLabel		: 'Vendor',
	    triggerAction	: 'all',
	    emptyText		: 'Select a Vendor...',
	    selectOnFocus	: true
	});
	
	vendor.store.load();
	
    // create the Data Store
    dsData = new Ext.data.Store(
	{
        url: "/pots/php/pots_data.php",
    	method:'post',
        reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
                {name: 'id', type:'int'},
	    		{name: 'name', type:'string'},
				{name: 'desc', type: 'string'},
				{name: 'cost', type	:'float'}
			]
        }),

        // turn on remote sorting
        remoteSort: true
    });
	
    dsData.setDefaultSort('name', 'asc');

	// the column model has information about grid columns
    // dataIndex maps the column to the specific data field in
    // the data store
    
    var cm = new Ext.grid.ColumnModel([
    	new Ext.grid.RowNumberer(),
		{
           header: "Name",
           dataIndex: 'name',
           editor: new Ext.form.TextField({allowBlank:false})
        },
		{
			id: 'desc',
	        header		:	'Description',
	    	dataIndex	:	'desc',
	    	sortable	:	true,
			editable	:	true,
			editor		:	new fm.TextField({allowBlank: true})
	    }, 
		{
			header		:	'Cost', 
			dataIndex	:	'cost',
			align		: 	'right',
			renderer	: Ext.util.Format.usMoney,
			editor		:	new fm.NumberField(
			{
				allowBlank: false,
				decimalPrecision:3
			})			
		}
    ]);

    // by default columns are sortable
    cm.defaultSortable = true;

	var grid = new Ext.grid.EditorGridPanel(
	{
        frame:true,
		region:'center',
        title:'Pots',
        store: dsData,
        cm: cm,
        trackMouseOver:true,
        selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),
		stripeRows: true,
		autoSizeColumns:true,
		autoSizeHeaders:true,
		//autoExpandColumn: 'desc',
        loadMask: true,
        viewConfig: 
		{
            forceFit: false
        },       
        tbar:[
        {
			id			: 'add',
			icon		: '/images/application/file-add.png',				
			cls			: 'x-btn-text-icon',			
            text		: 'Add',
			handler		: function ()
			{	        	
				showDetail(null);
			}
        },
		{
			text	:	'Save Changes',
			icon	: '/images/application/save.png',				
			cls		: 'x-btn-text-icon',			
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
							url:"/pots/php/process_pots.php",
							params:{data:jsonData},
							success:function(form, action) 
							{	
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
		},
		{
			id		: 'delete',
			icon	: '/images/application/file-delete.png',				
			cls		: 'x-btn-text-icon',			
			text	:	'Delete', 
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
									url:"/pots/php/process_pots.php",										
									params:{data:jsonData},
									success:function(form, action) 
									{
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
			handler	:	loadDataSource
		}]/*,        
        bbar: paging = new Ext.PagingToolbar(
		{
            pageSize: 25,
            store: dsData,
            displayInfo: true,
            displayMsg: 'Displaying fertilizers {0} - {1} of {2}',
            emptyMsg: "No fertilizers to display"
        })*/
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
    dsData.load({params:{start:0, limit:25}});
    
    function loadDataSource()	
    {	
    	dsData.load();
	}
});