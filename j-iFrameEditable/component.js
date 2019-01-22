COMPONENT('iframeeditable', 'bind:body', function(self, config) {

	var iframe, skip = false;

	self.readonly();
	self.nocompile && self.nocompile();

	self.init = function() {
		W.iframeeditableinstances = {};
	};

	self.destroy = function() {
		delete W.iframeeditableinstances[self.ID];
	};

	self.make = function() {
		W.iframeeditableinstances[self.ID] = self;
		self.aclass('ui-iframeeditable');
		self.html('<iframe src="about:blank" frameborder="0" scrolling="no"></iframe>');
		iframe = self.find('iframe');
	};

	self.format = function(type, url) {
		switch (type.toLowerCase()) {
			case 'bold':
				type = 'Bold';
				break;
			case 'italic':
				type = 'Italic';
				break;
			case 'underline':
				type = 'Underline';
				break;
			case 'link':
				type = 'CreateLink';
				break;
		}
		iframe[0].contentWindow.document.execCommand(type, false, url || null);
	};

	self.insert = function(value, encoded) {
		iframe[0].contentWindow.document.execCommand(encoded ? 'insertText' : 'insertHtml', false, value);
	};

	self.getNode = function() {
		var node = iframe[0].contentWindow.document.getSelection().anchorNode;
		if (node)
			return (node.nodeType === 3 ? node.parentNode : node);
	};

	self.getSelection = function() {
		var win = iframe[0].contentWindow;
		var doc = win.document;
		if (doc.selection && doc.selection.type === 'Text')
			return doc.selection.createRange().htmlText;
		else if (!win.getSelection)
			return;
		var sel = win.getSelection();
		if (!sel.rangeCount)
			return '';
		var container = doc.createElement('div');
		for (var i = 0, len = sel.rangeCount; i < len; ++i)
			container.appendChild(sel.getRangeAt(i).cloneContents());
		return container.innerHTML;
	};

	self.write = function(content) {

		var is = false;
		var offset = ('<div id="IFPOFFSET"></div><scr' + 'ipt>window.addEventListener(\'keydown\',function(){window.parent.iframeeditableinstances[\'{0}\'].resize2()});</scr' + 'ipt>').format(self.ID);

		content = content.replace(/<\/body>/i, function() {
			is = true;
			return offset + '</body>';
		});

		if (!is)
			content += offset;

		var win = iframe[0].contentWindow;
		var doc = win.document;
		doc.open();
		doc.write(content);
		doc.close();

		self.resize();
		setTimeout(self.resize, 500);
		setTimeout(self.resize, 1000);
		setTimeout(self.resize, 2000);
		setTimeout(self.resize, 3000);
	};

	self.resize2 = function() {
		setTimeout2(self.ID, function() {
			self.resize();
			var doc = iframe[0].contentWindow.document;
			var val = null;
			switch (config.bind) {
				case 'body':
					val = doc.body.innerHTML;
					break;
				case 'html':
					val = doc.documentElement.innerHTML;
					break;
				case 'contenteditable':
					var tmp = document.querySelector('[contenteditable]');
					if (tmp)
						val = tmp.innerHTML;
					break;
			}

			if (val != null) {
				skip = true;

				var index = val.lastIndexOf('<div id="IFPOFFSET">');
				if (index != -1)
					val = val.substring(0, index);

				self.set(val.replace(/contenteditable=".*?"|contenteditable/g, ''));
				self.change(true);
			}

		}, 50);
	};

	self.resize = function() {
		var el = $(iframe[0].contentWindow.document.getElementById('IFPOFFSET'));
		self.element.css('height', el.offset().top + 30);
	};

	self.setter = function(value) {

		if (skip) {
			skip = false;
			return;
		}

		if (value == null)
			iframe.attr('src', 'about:blank');
		else
			self.write(value);
	};
});