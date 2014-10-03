/**
 * @author Greivin
 */
var dsVendor = null;
var dsData = null;

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
	
	var gridForm = new Ext.form.BasicForm(
		Ext.get("general-form"),
		{			
		}
	);
		
    // create the Data Store
    dsData = new Ext.data.Store(
	{
        url: "/sizes/php/sizes_data.php",
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
				{name: 'default_price', type: 'float'}
			]
        }),
        remoteSort: false
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
			editor		:	new fm.TextField({allowBlank: false})
	    },
		{
			header		:	'Default Price', 
			dataIndex	:	'default_price',
			align		: 	'right',
			renderer	: Ext.util.Format.usMoney,
			editor		:	new fm.NumberField(
			{
				allowBlank: false,
				decimalPrecision: 3
			})			
		}
    ]);

    // by default columns are sortable
    cm.defaultSortable = true;

	var grid = new Ext.grid.EditorGridPanel(
	{
		region:'center',		
        frame:true,
        title:'Sizes',
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
			icon: '/images/application/file-add.png',				
			cls: 'x-btn-text-icon',
            text		: 'Add',
			handler		: function ()
			{
				showDetail(null);
			}
        },
		{
			text	:	'Save Changes',
			icon: '/images/application/save.png',				
			cls: 'x-btn-text-icon',
			handler	:	function()
			{
	        	var jsonData = "";
				
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
							url:"/sizes/php/process_sizes.php",
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
			text	:	'Delete', 
			icon: '/images/application/file-delete.png',				
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
									url:"/sizes/php/process_sizes.php",										
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
			icon: '/images/application/refresh.png',				
			cls: 'x-btn-text-icon',
			handler	:loadDataSource
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
    // trigger the data store load
    dsData.load();
    
    function loadDataSource()	
    {	
    	dsData.load();
	}
});