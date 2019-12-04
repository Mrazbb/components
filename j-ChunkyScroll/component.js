COMPONENT('chunkyscroll', 'parent:parent;limit:80;margin:0;rowheight:0;scrolltop:1', function(self, config) {

	var cls = 'ui-' + self.name;
	var cls2 = '.' + cls;

	var opt = {};
	var container;
	var scrollarea;
	var body;
	var set;
	var seb;
	var init = false;

	self.readonly();

	self.make = function() {

		self.aclass(cls);

		var scr = self.find('script');
		self.template = Tangular.compile(scr.html());
		scr.remove();

		self.append('<div class="{0}-container"></div>'.format(cls));

		var seh = '<div style="height:0px"></div>';
		set = $(seh);
		seb = $(seh);

		self.scrollbar = new SCROLLBAR(self.find(cls2 + '-container'), { visibleY: true, onscroll: self.scroll });
		self.scrolltop = self.scrollbar.scrollTop;
		container = self.find('.ui-scrollbar-body');

		var dom = container[0];
		var div = document.createElement('DIV');
		dom.appendChild(set[0]);
		dom.appendChild(div);
		dom.appendChild(seb[0]);
		body = $(div);

		opt.rows = [];
		opt.pos = -1;
		opt.plus = 0;
		opt.scrolltop = 0;
		opt.prev = 0;

		scrollarea = self.scrollbar.area[0];
		self.resize();
	};

	self.setter = function(value) {
		self.update(value || EMPTYARRAY);
	};

	self.resize = function() {

		if (self.release())
			return;

		var el = config.parent ? config.parent === 'window' ? $(W) : config.parent === 'parent' ? self.parent() : self.element.closest(config.parent) : self.parent();
		var h = el.height();
		var w = el.width();
		var width = WIDTH();
		var margin = config.margin;
		var responsivemargin = config['margin' + width];

		if (responsivemargin != null)
			margin = responsivemargin;

		if (h === 0 || w === 0) {
			self.$waiting && clearTimeout(self.$waiting);
			self.$waiting = setTimeout(self.resize, 234);
			return;
		}

		var css = {};

		css.height = h - margin;
		self.find(cls2 + '-container').css(css);

		self.element.SETTER('*', 'resize');
		var c = cls + '-hidden';
		self.hclass(c) && self.rclass(c, 100);

		self.scrollbar.resize();

		if (!init) {
			self.rclass('invisible', 250);
			init = true;
		}
	};

	self.update = function(rows, noscroll) {

		if (noscroll != true && config.scrolltop)
			scrollarea.scrollTop = 0;

		opt.rows = rows;
		self.refreshmeta();
		self.scroll();
	};

	self.refreshmeta = function() {
		opt.pos = -1;
		opt.max = Math.ceil(opt.rows.length / config.limit) - 1;
		opt.frame = config.limit * (config.rowheight || 30);

		if (config.limit * 2 > opt.rows.length) {
			config.limit = opt.rows.length;
			opt.frame = config.limit * (config.rowheight || 30);
			opt.max = 1;
		}
	};

	self.render = function() {

		var t = opt.pos * opt.frame;
		var b = (opt.rows.length * (config.rowheight || 30)) - (opt.frame * 2) - t;
		var pos = opt.pos * config.limit;
		var posto = pos + (config.limit * 2);

		set.css('height', t);
		seb.css('height', b < 2 ? 2 : b);

		if (opt.prev < t)
			scrollarea.scrollTop = t + 5;

		opt.prev = t;

		var node = body[0];
		node.innerHTML = '';

		for (var i = pos; i < posto; i++) {

			var row = opt.rows[i];
			if (!row)
				break;

			if (!(row instanceof HTMLElement)) {
				var el = $(self.template(opt.rows[i]));

				// Obtains row height if it isn't declared
				if (!config.rowheight) {
					config.rowheight = el.height();
					self.refreshmeta();
				}

				opt.rows[i] = el[0];
			}

			if (opt.rows[i])
				node.appendChild(opt.rows[i]);
			else
				break;
		}

		config.redraw && EXEC(self.makepath(config.redraw), self, pos);
	};

	self.scroll = function() {

		if (!scrollarea)
			return;

		var y = scrollarea.scrollTop + 1;
		opt.scrolltop = y;

		if (y < 0)
			return;

		var frame = Math.ceil(y / opt.frame) - 1;
		if (frame === -1)
			return;

		if (opt.pos !== frame) {

			// The content could be modified
			var plus = (scrollarea.offsetHeight / 2) - opt.frame;
			if (plus > 0) {
				frame = Math.ceil(y / (opt.frame + plus)) - 1;
				if (opt.pos === frame)
					return;
			}

			if (opt.max && frame >= opt.max)
				frame = opt.max;

			opt.pos = frame;
			self.render();
		}
	};
});