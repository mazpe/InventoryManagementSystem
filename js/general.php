/**
 * The real url for the specific file. 
 * @param {String} path
 * @param {String} file
 * 
 * @return {String}
 */
function getURL(path, file)
{
	var url, firstIndex, baseURL, newURL;
	
	url = document.location.toString();
	
	firstIndex = url.indexOf(path);
	
	baseURL = url.substr(0, firstIndex);
	
	newURL = baseURL + path + '/' + file;
	  
	return newURL;
}