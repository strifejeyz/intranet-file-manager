"use strict";
var $ = {
	// query
	q: (elem) => {
		return document.querySelector(elem);
	},

    // callback is a func to accept responseText
	get: (link, callback) => {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200 && callback) {
				return callback(xhr.responseText);
			}
		}
		xhr.open('GET', link);
		xhr.send();
	},
	
    // callback is a func to accept responseText
	post: (link, callback, params = null) => {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4 && xhr.status == 200 && callback) {
				return callback(xhr.responseText);
			}
		}
		xhr.open('POST', link);
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

		if (params == null) {
			xhr.send();
		} else {
			xhr.send(encodeURI(params));
		}
    },
    
    create: (elementName) => {
		return document.createElement(elementName);
	},
	
	convertBytes: function (bytes) {
		var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
		if (bytes == 0) return '0 Byte';
		var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
	}
}



var listAllFiles = (json) => {
	const defaultPath = json['default_path'];
	const tbody = $.q('.tbody');
	const data = JSON.parse(json);
		
	//reset any value before pushing a new one.
		tbody.innerHTML = "<tr><td class='prev_dir_button'><img class='prev_dir_button' src='img/back.png' width=20 height=30></td><td></td><td></td><td></td></tr>";

	//save the current dir so we knew where to comeback
	$.q('body').setAttribute('data-prev-dir', data['default_path']);
		
	if (data['directories'] != undefined) {
		for (let d = 0; d < data['directories']['names'].length; d++) {
			const rows = $.create('tr');
				// for filenames,size,types
				rows.innerHTML += "<td class='folder'><img src='img/folder.png' width=20 height=20> " + data['directories']['names'][d] + "</td>";
				rows.innerHTML += "<td>dir</td>";
				rows.innerHTML += "<td>...</td>";
				rows.innerHTML += "<td></td>";
	
				// Set absolute path to its attribute
				var escapedPathName = data['directories']['paths'][d];
					//escapedPathName.replace(' ', '__SPACE__');
					//escapedPathName.replace('/' , '__SLASH__');
				rows.setAttribute('data-path', escapedPathName);
				tbody.appendChild(rows);
		}
	}
	
	if (data['files']['names'] != undefined) {
		var type = "<img src='img/file.png' width=20 height=20>";

		for (let f = 0; f < data['files']['names'].length; f++) {
			var filepath = data['files']['paths'][f];
			filepath.replace('./', '');

			if (data['files']['types'][f] == 'png' || data['files']['types'][f] == 'jpg' || data['files']['types'][f] == 'jpeg') {
				type = "<img class='thumbnail' src='" + filepath + "' width=100 height=70>";
			} 

			const rows = $.create('tr');
			// for filenames,size,types
			if (data['files']['types'][f] == 'mp3' || data['files']['types'][f] == 'm4a' || data['files']['types'][f] == 'wma') {
				type = "<img src='img/music.png' width=20 height=20> ";
				rows.innerHTML = "<td>"+type+"<a target='__blank' href='" + filepath +"'>"+data['files']['names'][f]+"</a></td>";
			} else {
				rows.innerHTML = "<td>"+ type + data['files']['names'][f] + "</td>";
			}

			rows.innerHTML += "<td>" + data['files']['types'][f] + "</td>";
			rows.innerHTML += "<td>" + $.convertBytes(data['files']['sizes'][f]) + "</td>";
			rows.innerHTML += "<td class='download-button'><a href='"+ data['files']['paths'][f] +"'>Download</a></td>";

			// Set absolute path to its attribute
			rows.setAttribute('data-path', data['files']['paths'][f]);
			tbody.appendChild(rows);
		}
	}
	
	// we setup event bubble listener for first TD in the table for whenever
	// a user clicks on a folder, this will change the directory.
	tbody.addEventListener('click', (event) => {
		// if folder is clicked, we'll get the embedded path in its data-path attr.
		if (event.target.className === "folder") {
			const openPath = 'path=' + event.target.parentElement.getAttribute('data-path');
			$.post("proc.php", listAllFiles, openPath);
		} 

		if (event.target.className === "prev_dir_button") {
			$.post('proc.php', listAllFiles, "prev=true");
		}
	});
}



window.onload = () => {
	$.post('proc.php', listAllFiles);
}