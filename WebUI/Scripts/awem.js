awem = function ($) {

    // keys you can type without opening menu dropdown
    // enter, esc, shift, left arrow, right arrow, tab
    var nonOpenKeys = [13, 27, 16, 37, 39, 9]; // keys that won't open the menu

    // down and up arrow, enter, esc, shift, left arrow, right arrow
    var controlKeys = [40, 38, 13, 27, 16, 37, 39];

    var nonComboSearchKeys = [40, 38, 13, 27, 16, 37, 39, 9];

    var isMobile = function () { return awem.isMobileOrTablet(); };

    var keycode = {
        enter: 13,
        backspace: 8,
        esc: 27,
        down: 40,
        up: 38,
        tab: 9
    };

    function format(s, args) {
        return s.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined'
      ? args[number]
      : match;
        });
    };

    function containsVal(itemK, vals) {
        var res = false;
        $.each(vals, function (_, value) {
            if (itemK == escape(value)) {
                res = true;
                return false;
            }
        });

        return res;
    }

    function inArray(val, vals) {
        var res = -1;
        $.each(vals, function (i, value) {
            if (val == value) {
                res = i;
                return false;
            }
        });

        return res;
    }

    function contains(key, keys) {
        return $.inArray(key, keys) != -1;
    }

    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        '"': '&quot;',
        "'": '&#39;'
    };

    function escape(str) {
        return String(str).replace(/[&<"'\/]/g, function (s) {
            return entityMap[s];
        });
    }

    function readTag(o, prop, nullVal) {
        var res = nullVal;

        if (o.tag && o.tag[prop] != null) {
            res = o.tag[prop];
        }

        return res;
    }

    function layDropdownMenu(o, $menu, isFixed, capHeight, $opener) {
        $menu.css('min-height', 'auto');
        var winh = $(window).height();
        var topd = o.f.offset().top;
        var captionHeight = o.f.outerHeight();
        capHeight = capHeight || captionHeight;
        var topfx = topd - $(window).scrollTop();
        var bot = winh - (topfx + capHeight);
        var limit = 300;
        var lim = 400;

        var $itemscont = $menu.find('.oitemscont').css('overflow-y', 'auto');
        var resth = $menu.find('.osrccont:visible').outerHeight(true) + ($menu.outerHeight(true) - $menu.height());

        limit = $itemscont.length ? Math.min(limit, $itemscont.children().first().outerHeight(true)) : $menu.outerHeight(true) + 10;

        var isTop = 0;

        if (bot > limit) {
        } else if (topfx > limit || topfx > (bot + 5)) {
            isTop = 1;
        }

        var space = Math.min(isTop ? topfx : bot, lim) - 20;

        if (isFixed) {
            topd = topfx;
        }

        if (space < 150) {
            space = Math.max(150, winh - 50);
            isTop = 0;
        }

        $itemscont.css('max-height', (space - resth) + 'px');

        var menuHeight = $menu.outerHeight(true);

        var botRemSpace = winh - (topfx + menuHeight + capHeight);

        if (isFixed) {
            $menu.css('position', 'fixed');
        }

        if ($opener) {
            var left = $opener.offset().left;
            var lspace = $(window).width() - ($opener.offset().left + $menu.outerWidth(true));

            if (lspace < 0) {
                left -= ($menu.outerWidth() - $opener.outerWidth());
                if (left < 0) left = 0;
            }

            $menu.css('left', left);
        }

        botRemSpace = botRemSpace < 0 ? botRemSpace - 20 : 0;

        if (botRemSpace < 0 && topfx > menuHeight) {
            $menu.css('top', Math.max(topd - menuHeight, 0) + 'px');
            $menu.css('min-height', $menu.outerHeight() + 'px');
        } else
            $menu.css('top', (topd + capHeight + botRemSpace) + 'px');

    }

    function buttonGroupRadio(o) {
        return nbuttonGroup(o);
    }

    function buttonGroupCheckbox(o) {
        return nbuttonGroup(o, 1);
    }

    function bootstrapDropdown(o) {
        function render() {
            o.d.empty();
            var caption = awem.clientDict.Select;
            var items = '';
            $.each(o.lrs, function (i, item) {
                var checked = $.inArray(item.K, awe.val(o.v)) > -1;
                if (checked) caption = item.C;
                items += '<li role="presentation"><input style="display:none;" type="radio" value="' + item.K + '" name="' + o.nm + '" ' + (checked ? 'checked="checked"' : '') +
                    '" /><a role="menuitem" tabindex="-1" href="#" >' + item.C + '</a></li>';
            });
            if (!items) items = "<li class='empty'>(empty)</li>";
            var res = '<div class="dropdown"><button class="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" aria-expanded="true"><span class="caption">'
                + caption +
                '</span> <i class="caret"></i></button><ul class="dropdown-menu" role="menu">' + items + "</ul><div>";

            o.d.append(res);
        };

        o.v.data('api').render = render;

        o.v.on('change', render);

        o.d.on('click', 'a', function (e) {
            e.preventDefault();
            $(this).prev().click();//click on the hidden radiobutton
        });
    }

    function nbuttonGroup(o, multiple) {
        var $odisplay;

        function init() {
            $odisplay = o.modo.odisplay;
            o.modo.odropdown.addClass('buttonGroup');

            $odisplay.on('click', '.awe-btn', function () {
                var index = $(this).data('index');
                o.modo.inputCont.find('input').eq(index).click();
            });
        }

        function setSelectionDisplay() {
            var val = awe.val(o.v);

            var items = '';
            $.each(o.lrs, function (index, item) {
                var selected = containsVal(item.K, val) ? "awe-selected" : "";
                items += '<button type="button" class="awe-btn awe-il ' + selected + '" data-index="' + index + '" data-key="' + item.K + '">' + item.C + '</button>';
            });

            $odisplay.html(items);
        }

        function setSelectionDisplayChange() {
            var vals = awe.val(o.v);
            $odisplay.children('.awe-selected').removeClass('awe-selected');
            $.each(vals, function (i, v) {
                $odisplay.children('[data-key="' + v + '"]').addClass('awe-selected');
            });
        }

        var opt = {
            setSel: setSelectionDisplay,
            setSelChange: setSelectionDisplayChange,
            init: init,
            multiple: multiple,
            noMenu: 1
        };

        return odropdown(o, opt);
    }

    function multiselb(o) {
        o.d.addClass("multiselb");
        function renderCaption() {
            return '<div class="caption">' + o.modo.inlabel + '</div>';
        }

        return odropdown(o, {
            multiple: 1,
            renderCaption: renderCaption
        });
    }

    function multiselect(o) {
        var captionText;
        var $multi = $('<div class="multi"></div>');
        var $searchtxt = $('<input type="text" class="osearch awe-il awe-txt" />');
        var $dropmenu;
        var $caption;

        if (!isMobile())
            $multi.append($searchtxt);

        function init() {
            o.modo.odisplay.append($multi);
            $dropmenu = o.modo.dropmenu;
            captionText = o.modo.caption;
        }

        function renderSelectedItem(item, index) {
            return '<div class="multiItem awe-il awe-btn">' + item.C + '<span class="multiRem" data-index="' + index + '" data-key="' + item.K + '">x</span></div>';
        }

        function handleCaption() {
            if ($multi.find('.multiRem').length)
                $caption.hide();
            else
                $caption.show();
        }

        var setSelectionDisplay = function () {
            var vals = awe.val(o.v);
            $multi.find('.caption').remove();
            $multi.find('.multiItem').remove();
            var items = '';
            $.each(o.lrs, function (index, item) {
                if (containsVal(item.K, vals)) {
                    items += renderSelectedItem(item, index);
                }
            });

            $caption = $('<span class="caption">' + captionText + '</span>');

            if (items) {
                autoWidth($searchtxt);
                $caption.hide();
            }

            $multi.prepend(items);
            $multi.prepend($caption);
            $searchtxt.val('');
        };

        function setSelectionDisplayChange() {
            var vals = awe.val(o.v);

            // remove keys and add items
            $multi.find('.multiRem').each(function () {
                var val = $(this).data('key');
                var indexFound = inArray(val, vals);
                if (indexFound > -1) {
                    //remove from vals
                    vals.splice(indexFound, 1);
                } else {
                    //remove .multiRem
                    $(this).parent().remove();
                }
            });

            //add multiRem for remaining vals
            var items = '';
            $.each(o.lrs, function (index, item) {
                if (containsVal(item.K, vals)) {
                    items += renderSelectedItem(item, index);
                }
            });

            $searchtxt.val('');
            autoWidth($searchtxt);
            if (isMobile()) {
                $multi.append(items);
            } else {
                $searchtxt.before(items);
            }
            handleCaption();
        }

        $multi.on('click', function (e) {
            if (!$(e.target).is('.multiRem')) {
                $searchtxt.focus();
                if (!$dropmenu.hasClass('open')) {
                    o.v.data('api').toggleOpen();
                }
            }
        });

        $searchtxt.on('focusin', function () {
            //o.v.data('api').search('');
            $caption.hide();
            autoWidth($(this));
        });

        function autoWidth(input) {
            input.css('width', Math.min(Math.max((input.val().length + 2) * 10, 30), $multi.width()) + 'px');
        }

        $searchtxt.on('keyup', function (e) {
            if (!$dropmenu.hasClass('open') && !contains(e.which, nonOpenKeys)) {
                if (!(e.which == keycode.backspace && !$searchtxt.val()))
                    o.v.data('api').toggleOpen();
            }

            if (!contains(e.which, controlKeys)) {
                var query = $(this).val();

                o.v.data('api').search(query);
            }
        });

        $searchtxt.on('keydown', function (e) {
            if (e.which == keycode.backspace && !$searchtxt.val()) {
                $multi.find('.multiRem:last').click();
            }

            autoWidth($searchtxt);
        });

        $searchtxt.on('focusout', function () {
            $searchtxt.val('').change();
            if (!$multi.children('.multiItem').length) {
                $searchtxt.css('width', '0');
                $caption.show();
            }
        });

        $multi.on('click', '.multiRem', function () {
            var index = $(this).data('index');
            o.modo.inputCont.find('input').eq(index).click();
            o.v.data('api').close();
            $searchtxt.focus();
        });

        var opt = {
            setSel: setSelectionDisplay,
            setSelChange: setSelectionDisplayChange,
            init: init,
            multiple: 1,
            prerender: function () {
            }
        };

        if (!isMobile()) {
            opt.searchOutside = 1;
            opt.noAutoSearch = 1;
        }

        return odropdown(o, opt);
    }

    function colorDropdown(o) {
        var caption;

        function init() {
            caption = o.modo.caption;
        }

        o.d.addClass("colordd");

        o.df = function () {
            return $.map(['#5484ED', '#A4BDFC', '#7AE7BF', '#51B749', '#FBD75B', '#FFB878', '#FF887C', '#DC2127', '#DBADFF', '#E1E1E1'],
                function (item) { return { K: item, C: item }; });
        };

        var renderCaption = function (selected) {
            var sel = caption;
            if (selected.length) {
                var color = selected[0].K;
                sel = '<div style="background:' + color + '" class="color">&nbsp;</div>';
            }

            return '<span class="caption">' + sel + '</span>';
        };

        var renderItemDisplay = function (item) {
            return '<span class="colorItem" style="background:' + item.K + '">&nbsp;</span>';
        };

        var opt = {
            renderItemDisplay: renderItemDisplay,
            renderCaption: renderCaption,
            noAutoSearch: 1,
            menuClass: "colorddmenu",
            init: init
        };

        odropdown(o, opt);
    }

    function imgDropdown(o) {
        var caption;

        o.d.addClass('imgdd');

        function init() {
            caption = o.modo.caption;
        }

        var opt = {
            menuClass: "imgddmenu",
            init: init
        };

        opt.renderItemDisplay = function (item) {
            return '<div class="imgddItem"><img src="' + item.Url + '"/> ' + item.C + '</div>';
        };

        opt.renderCaption = function (selected) {
            var sel = caption;
            if (selected.length)
                sel = '<img src="' + selected[0].Url + '"/>' + selected[0].C;
            return '<span class="caption">' + sel + '</caption>';
        };

        odropdown(o, opt);
    }

    function timepicker(o) {
        o.f.addClass("timep");

        function pad(num) {
            var s = "00" + num;
            return s.substr(s.length - 2);
        }

        o.df = function () {
            var step = readTag(o, "Step") || 30;
            var items = [];
            var ampm = o.tag.AmPm;
            for (var i = 0; i < 24 * 60; i += step) {
                var apindx = 0;
                var hour = Math.floor(i / 60);
                var minute = i % 60;

                if (ampm) {

                    if (hour >= 12) {
                        apindx = 1;
                    }

                    if (!hour) {
                        hour = 12;
                    }

                    if (hour > 12) {
                        hour -= 12;
                    }
                }

                var item = ampm ? hour : pad(hour);

                item += ":" + pad(minute);

                if (ampm) item += " " + ampm[apindx];

                items.push(item);
            }

            return $.map(items, function (v) { return { K: v, C: v }; });
        };

        return combobox(o);
    }

    function combobox(o) {
        o.d.addClass('combobox');

        var $v = o.v;
        var $comboval = $('<input type="radio" name="' + o.nm + '" />').hide();
        var $combotxt = $('<input type="text" class="awe-txt combotxt osearch" size="1" />');
        var $openbtn = $('<button type="button" class="cdropbtn odropbtn oddbtn awe-btn" tabindex="-1"><span class="selbtn"><i class="ocaret"></i></span></button>');
        var docClickRegistered = 0;

        function init() {
            o.d.append($comboval);
            o.modo.odisplay.append($combotxt).append($openbtn);
            $combotxt.attr('placeholder', o.modo.caption);
        }

        function setSelectionDisplay() {
            var vals = awe.val($v);

            var selected = $.grep(o.lrs, function (item) {
                return containsVal(item.K, vals);
            });

            var txtval = '';
            if (!selected.length && vals.length) {
                txtval = vals[0];
                $comboval.val(txtval);
                $comboval.prop('checked', true);
            }
            else if (selected.length) {
                txtval = selected[0].C;
            }

            $combotxt.val(txtval);
        }

        function docClickFocusHandler(e) {
            var $target = $(e.target);
            if (!$target.closest(o.modo.dropmenu).length && !$target.closest(o.d).length) {
                compval();
                checkComboval();
                docClickRegistered = 0;
                $(document).off('click focusin', docClickFocusHandler);
            }
        }

        function checkComboval() {
            if (!$v.parent().length) {
                return;
            }
            
            var comboval = $v.data('comboval');
            if (comboval != null) {
                var $inputCont = o.modo.inputCont;

                o.d.find(':radio').each(function (i, el) {
                    $(el).prop('checked', false);
                });

                var indexFound = $v.data('indexFound');

                if (indexFound != null) {
                    $inputCont.find('input').eq(indexFound).prop('checked', true);
                } else {
                    $comboval.val(comboval);
                    $comboval.prop('checked', true);
                }
                
                $v.data('api').close();
                $v.val(comboval);
                $v.change();
            }
        }

        $combotxt.on('focusin', function () {
            this.selectionStart = this.selectionEnd = this.value.length;

            if (!docClickRegistered) {
                $(document).on('click focusin', docClickFocusHandler);
                docClickRegistered++;
            }
        });

        $combotxt.on('keydown', function (e) {
            if (e.which == keycode.enter && !o.modo.dropmenu.hasClass('open')) {
                e.preventDefault();
                checkComboval();
            }
        });

        $combotxt.on('keyup', function (e) {
            var $dropmenu = o.modo.dropmenu;

            if (!$dropmenu.hasClass('open')) {
                if (!contains(e.which, nonOpenKeys)) {
                    $v.data('api').toggleOpen();
                }

                if (e.which == keycode.enter) {
                    checkComboval();
                }
            }

            if (!contains(e.which, nonComboSearchKeys)) {
                var query = $(this).val();

                $v.data('api').search(query);

                if (!$dropmenu.find('.oitem:visible').length) {
                    $v.data('api').close();
                }

                compval();
            }
        });

        $openbtn.on('click', function () {
            $v.data('api').search('');
            if (!isMobile())
                $combotxt.focus();
        });

        function compval() {
            var query = $combotxt.val();
            var $dropmenu = o.modo.dropmenu;
            var newVal;
            var indexFound;
            var itemFound;
            var reg = new RegExp('^' + query + '$', 'i');
            $.each(o.lrs, function (i, val) {
                if (reg.test(val.C)) {
                    indexFound = i;
                    itemFound = val;
                    newVal = val.K;
                }
            });

            $dropmenu.find('.selected').removeClass('selected');

            if (itemFound) {
                $dropmenu.find('.oitem').eq(indexFound).addClass('selected');
            } else {
                newVal = query;
            }

            $v.data('comboval', newVal);
            $v.data('indexFound', indexFound);
        }

        odropdown(o, {
            searchOutside: 1,
            noAutoSearch: 1,
            setSel: setSelectionDisplay,
            Combo: 1,
            init: init,
            prerender: function () { }
        });
    }

    function menuDropdown(o) {
        o.d.addClass("menudd");
        var opt = {
            menuClass: "menuddmenu",
        };

        opt.renderCaption = function () {
            return '<div class="caption">' + o.modo.caption + '</div>';
        };

        opt.renderItemDisplay = opt.renderItemDisplay || function (item) {
            return '<a href="' + item.K + '">' + item.C + '</a>';
        };

        opt.onItemClick = function (e) {
            var $trg = $(e.target);
            if ($trg.is('.oitem')) {
                $trg.find('a').get(0).click();
            }
        };

        return odropdown(o, opt);
    }

    function odropdown(o, opt) {

        var api = o.v.data('api');
        api.render = render;

        opt = opt || {};

        opt.renderItemDisplay = opt.renderItemDisplay || function (item) {
            return item.C;
        };

        opt.renderCaption = opt.renderCaption || function (selected) {
            var sel = caption;
            if (selected.length)
                sel = selected[0].C;

            return '<div class="caption">' + inlabel + sel + '</div>';
        };

        opt.setSel = opt.setSel || function () {
            $odisplay.html(opt.renderSelected());
        };

        opt.setSelChange = opt.setSelChange || opt.setSel;

        opt.renderItems = opt.renderItems || function (rs) {
            var res = '';
            $.each(rs, function (i, item) {
                res += '<li class="oitem" data-index="' + i + '">' + opt.renderItemDisplay(item) + '</li>';
            });

            if (!rs.length) {
                res += '<li class="empty">(empty)</li>';
            }

            return res;
        };

        opt.renderSelected = opt.renderSelected || function () {
            var vals = awe.val(o.v);
            var selected = $.grep(o.lrs, function (item) {
                return containsVal(item.K, vals);
            });

            var sel = opt.renderCaption(selected);

            return format(btnstr, [sel]);
        };

        opt.onItemClick = opt.onItemClick || function () {
            var $oitem = $(this);
            var index = $oitem.data('index');
            var input = $inputCont.find('input').eq(index);

            if (opt.Combo) {
                if (o.v.data('comboval') != o.lrs[index].C) {
                    input.prop('checked', false);
                }
            }

            input.click();
            if (!noSelClose) {
                close();
            }

            var $osearch = $odisplay.find('.osearch');
            if ($osearch.length && !isMobile()) {
                $osearch.focus();
            } else {
                $odisplay.find('.odropbtn').focus();
            }

            $searchtxt.val('');
            search('', $oitem);
            if (noSelClose) {
                lay();
            }
        };

        opt.prerender = opt.prerender || function () {
            $odisplay.append(format(btnstr, [opt.renderCaption([])]));
        };

        function render() {
            opt.setSel();

            if (o.lrs.length > 10 && !opt.noAutoSearch)
                $searchcont.show();
            else
                $searchcont.hide();

            if (!opt.noMenu)
                $menu.html(opt.renderItems(o.lrs));

            $inputCont.html(renderHiddenInputs());

            markMenuSelectedItems();
        };

        function renderHiddenInputs() {
            var type = opt.multiple ? "checkbox" : "radio";
            var res = '';
            var vals = awe.val(o.v);
            var selFirst = autoSelectFirst && (!vals.length || vals.length == 1 && vals[0] == '');

            $.each(o.lrs || [], function (i, item) {
                var checked = containsVal(item.K, vals) || !i && selFirst;
                res += '<input type="' + type + '" value="' + item.K + '" name="' + o.nm + '" ' + (checked ? 'checked="checked"' : '') + ' />';
            });

            return res;
        }

        function markMenuSelectedItems() {
            var val = awe.val(o.v);
            var items = o.lrs;
            $dropmenu.find('.oitem').each(function (i, element) {
                var checked = containsVal(items[i].K, val);
                if (checked) {
                    $(element).addClass('selected');
                } else {
                    $(element).removeClass('selected');
                }
            });
        }

        function autofocus($oitem) {
            if ($oitem) {
                focus($oitem);
            } else {
                var $selected = $dropmenu.find('.selected:visible');
                if ($selected.length && !opt.multiple) {
                    focus($selected);
                } else {
                    focus($dropmenu.find('.oitem:visible:first'));
                }
            }
            scrollToFocused();
        }

        function scrollToFocused() {

            var $focused = $itemscont.find('.focus');

            if ($focused.length) {
                var pos = $focused.position().top - $itemscont.position().top;
                var fh = $focused.outerHeight(true);
                var menuHeight = $itemscont.height();

                if (pos + fh > menuHeight && pos + fh <= menuHeight + fh) {
                    $itemscont.scrollTop($itemscont.scrollTop() + fh);
                }
                else if (pos < 0) {
                    $itemscont.scrollTop($itemscont.scrollTop() - fh);
                }
                else if (pos > menuHeight) {
                    var nv = $itemscont.scrollTop() + pos - menuHeight / 2 + fh;
                    nv -= (nv % fh);
                    $itemscont.scrollTop(nv);
                }
            }
        }

        function focus(item) {
            $dropmenu.find('.focus').removeClass('focus');
            item.addClass('focus');
        }

        function search(query, $oitem) {
            var items = o.lrs;
            var reg = new RegExp(query, "i");
            $dropmenu.find('.oitem').each(function (i, element) {
                if (reg.test(items[i].C)) {
                    $(element).show();
                } else {
                    $(element).hide();
                }
            });

            autofocus($oitem);
        }

        function docClickHandler(e) {
            if (!$(e.target).closest($odisplay).length && !$(e.target).closest($dropmenu).length) {
                close();
            }
        };

        function close() {
            if ($dropmenu.hasClass('open')) toggleOpen();
        }

        function toggleOpen() {
            $dropmenu.toggleClass('open');
            if ($dropmenu.hasClass('open')) {
                if (zIndex) {
                    $dropmenu.css('z-index', zIndex + 1);
                }

                $dropmenu.css('min-width', $odisplay.width() + 'px');
                lay();

                autofocus();

                $(document).on('mousedown touchstart', docClickHandler);

                if (!opt.searchOutside && !isMobile()) {
                    $searchtxt.focus();
                }

                $searchtxt.val('');
                search('');

            } else {
                $(document).off('mousedown', docClickHandler);
            }
        }

        function lay() {
            layDropdownMenu(o, $dropmenu, isFixed, null, o.d);
        }

        var btnstr = '<button type="button" class="odropbtn oddbtn awe-btn">{0}<span class="selbtn"><i class="ocaret"></i></span></button>';

        var $odropdown = $('<div class="odropdown"></div>');
        var $odisplay = $('<div class="odisplay"></div>');
        var inlabel = readTag(o, 'InLabel', '');
        var caption = readTag(o, 'Caption', awem.clientDict.Select);
        var autoSelectFirst = readTag(o, 'AutoSelectFirst');
        var noSelClose = readTag(o, 'NoSelClose');
        var $inputCont = $('<div class="inputCont"></div>').hide();

        var $dropmenu = $('<div class="omenu" tabindex="-1"></div>').addClass(opt.menuClass).data('owner', $odropdown);
        if (o.rtl) $dropmenu.css('direction', 'rtl');

        var $searchcont = $('<div class="osrccont"><input type="text" class="osearch awe-txt" placeholder="search..." size="1"/></div>');
        var $searchtxt = $searchcont.find('.osearch');

        if (isMobile())
            $dropmenu.addClass('omobile');

        $odropdown.append($odisplay);

        $dropmenu.append($searchcont);
        var $itemscont = $('<div class="oitemscont"><ul class="omenuitems" tabindex="-1"></ul></div>');
        $dropmenu.append($itemscont);

        var $menu = $itemscont.children().first();
        o.d.append($inputCont);
        o.d.append($odropdown);
        o.f.addClass('odfield');
        
        o.modo = { dropmenu: $dropmenu, inputCont: $inputCont, odisplay: $odisplay, caption: caption, odropdown: $odropdown, inlabel: inlabel };

        opt.init && opt.init();

        opt.prerender();

        if (!opt.noMenu) {
            var isFixed = 0;
            var zIndex;
            var uidialog = o.d.closest('.awe-uidialog');

            var id = o.i + '-dropmenu';
            $('#' + id).remove();
            $dropmenu.attr('id', id);

            if (uidialog.length) {
                isFixed = true;
                zIndex = uidialog.css('z-index');
                uidialog.append($dropmenu);
            } else if (o.d.parents('.modal-dialog').length) {
                isFixed = true;
                zIndex = o.d.closest('.modal').css('z-index');
                o.d.closest('.modal').append($dropmenu);
            } else {
                $('body').append($dropmenu);
            }

            $dropmenu.on('click', '.oitem', opt.onItemClick).on('mousemove', '.oitem', function () {
                focus($(this));
            });

            $odropdown.on('click', '.odropbtn', function () {
                toggleOpen();
            });

            $odisplay.on('keydown', function (e) {
                if ($dropmenu.hasClass('open')) {
                    handleBasicKeys(e);
                }
            });

            $dropmenu.on('keydown', function (e) {
                handleBasicKeys(e);
            });

            function handleBasicKeys(e) {
                var which = e.which;
                var $focused = $dropmenu.find('.focus');
                if (contains(e.which, controlKeys))
                    e.preventDefault();

                if (which == keycode.down) {
                    var $next = $focused.nextAll('.oitem:visible:first');
                    if ($next.length) {
                        focus($next);
                        scrollToFocused();
                    }
                } else if (which == keycode.up) {
                    var $prev = $focused.prevAll('.oitem:visible:first');
                    if ($prev.length) {
                        focus($prev);
                        scrollToFocused();
                    }
                } else if (which == keycode.enter) {
                    $focused.click();
                } else if (which == keycode.esc) {
                    close();
                }
            }

            $searchtxt.on('keyup', function (e) {
                if (!contains(e.which, controlKeys)) {
                    search($(this).val());
                }
            });

            api.toggleOpen = toggleOpen;
            api.layMenu = lay;
            api.search = search;
            api.close = close;
        }

        o.v.on('change', function () {
            opt.setSelChange();
            markMenuSelectedItems();
            o.v.data('comboval', null);
            o.v.data('indexFound', null);
        });

        $(window).resize(close);
    }

    function dropdownPopup(o) {
        var p = o.p; //popup properties
        var popup = p.d; //popup div
        var wrap = $('<div class="dropdownPopupWrap"><div class="dropdownPopup"></div></div>').hide();

        var $dropdown = wrap.find('.dropdownPopup');
        $dropdown.append(popup);

        var isFixed;
        var zIndex;
        var uidialog = o.f.closest('.awe-uidialog');
        if (uidialog.length) {
            isFixed = true;
            zIndex = uidialog.css('z-index');
            uidialog.append(wrap);
        } else if (o.f.parents('.modal-dialog').length) {
            isFixed = true;
            zIndex = o.f.closest('.modal').css('z-index');
            o.f.closest('.modal').append(wrap);
        } else {
            $('body').prepend(wrap);
        }

        function layPopup() {
            //minimum height of the lookup/multilookup content
            p.mlh = Math.min(250, $(window).height() - 150);
            $dropdown.css('max-height', ($(window).height() - 20) + 'px');
            $dropdown.css('overflow-y', 'auto');
            var capHeight = o.f.find('.awe-openbtn').outerHeight(true);
            if (zIndex) {
                $dropdown.css('z-index', zIndex + 1);
            }

            layDropdownMenu(o, $dropdown, isFixed, capHeight, o.f);
            layDropdownMenu(o, $dropdown, isFixed, capHeight, o.f);
        }

        function outClickClose(e) {

            var $et = $(e.target);
            if (!($et.closest(o.f).length || $et.closest($dropdown).length || !$et.closest($(document)).length)) {
                var $omenu = $(e.target).closest('.omenu');
                if ($omenu.length) {
                    if (!$omenu.data('owner').closest($dropdown).length) {
                        api.close();
                    }
                } else {
                    api.close();
                }
            }
        }

        $dropdown.on('awelstresize aweload', layPopup);

        var api = function () { };
        api.open = function () {
            wrap.show();

            p.isOpen = 1;
            layPopup();
            $(document).on('click.ddp', outClickClose);

            if (!isMobile()) {
                setTimeout(function () { popup.find(':tabbable:first').focus(); }, 10);
            }
        };

        api.close = function () {
            wrap.hide();
            p.isOpen = 0;
            if (p.cl) {
                p.cl();
            }
            popup.trigger('aweclose');
            if (!p.dntr) {
                wrap.remove();
            }
            $(document).off('click.ddp', outClickClose);
        };

        api.destroy = function () {
            api.close();
            wrap.remove();
        };

        popup.data('api', api);

        // add btns if any
        if (p.btns) {
            var footer = $('<div></div>').addClass('dropdownPopupButtons');
            $dropdown.append(footer);
            $.each(p.btns, function (i, e) {
                var btn = $('<button type="button" class="awe-btn inl-btn">' + e.text + '</button>');
                btn.click(function () { e.click.call(popup); });
                footer.append(btn);
            });
        }

        return wrap;
    }

    function bootstrapPopup(o) {
        var p = o.p; //popup properties
        var popup = p.d; //popup div
        var modal = $('<div class="modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">' +
            '<div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title"></h4></div></div></div></div>');

        var hasFooter = p.btns && p.btns.length;

        //minimum height of the lookup/multilookup content
        p.mlh = !p.f ? 250 : 0;

        if (!p.t) {
            p.t = "&nbsp;"; //put one space when no title
        }

        popup.addClass("modal-body");
        popup.css('overflow', 'auto');

        modal.find('.modal-content').append(popup);
        modal.find('.modal-title').html(p.t);
        popup.show();

        //use to resize the popup when fullscreen
        function autoResize() {
            var h = $(window).height() - 120;
            if (hasFooter) h -= 90;
            if (h < 400) h = 400;
            popup.height(h);
            popup.trigger('aweresize');
        }

        var api = function () { };
        api.open = function () {
            modal.appendTo($('body')); //appendTo each time to prevent modal to show under current top modal
            modal.modal('show');
            p.isOpen = 1;
            popup.trigger('aweopen');
            if (p.f) autoResize();
        };
        api.close = function () {
            modal.modal('hide');

            p.isOpen = 0;
            if (p.cl) {
                p.cl();
            }
            if (!p.dntr) {
                popup.find('*').remove();
                popup.closest('.modal').remove();
            }
        };

        api.destroy = function () {
            api.close();
            $(window).off('resize', autoResize);
            popup.closest('.modal').remove();
        };

        popup.data('api', api);

        modal.on('hidden.bs.modal', function () {
            popup.trigger('aweclose');
        });

        $('body').append(modal);

        //fullscreen
        if (p.f) {
            modal.find('.modal-dialog').css('width', 'auto').css('margin', '10px');
            $(window).on('resize', autoResize);
        }

        //add buttons if any
        if (hasFooter) {
            var footer = $('<div class="modal-footer"></div>');
            modal.find('.modal-footer').remove();
            modal.find('.modal-content').append(footer);
            $.each(p.btns, function (i, e) {
                var btn = $('<button type="button" class="btn btn-default">' + e.text + '</button>');
                btn.click(function () { e.click.call(popup); });
                footer.append(btn);
            });
        }
    }

    function inlinePopup(o) {
        var p = o.p; //popup properties
        var popup = p.d; //popup div
        var wrap = $('<div class="wrap"></div>').hide();

        //minimum height of the lookup/multilookup content
        p.mlh = 250;

        wrap.append(popup);

        //decide where to attach the inline popup
        //tag and tags are set using .Tag(object) .Tags(string)
        if (o.tag && o.tag.target) {
            $('#' + o.tag.target).append(wrap);
        } else if (o.tag && o.tag.cont) {// cont used in grid nesting
            o.tag.cont.prepend(wrap);
        } else if (o.tags) {
            $('#' + o.tags).append(wrap);
        } else if (o.f) { //component field
            o.f.after(wrap);
        } else {
            $('body').prepend(wrap);
        }

        var api = function () { };
        api.open = function () {
            wrap.show();
            p.isOpen = 1;
            popup.trigger('aweopen');
        };
        api.close = function () {
            wrap.hide();
            p.isOpen = 0;
            if (p.cl) {
                p.cl();
            }
            popup.trigger('aweclose');
            if (!p.dntr) {
                wrap.remove();
            }
        };
        api.destroy = function () {
            api.close();
            wrap.remove();
        };

        popup.data('api', api);

        var title = $('<div class="inl-title"></div>');
        var closeBtn = $('<button type="button" class="awe-btn">&nbsp;X&nbsp;</button>').click(api.close);
        title.append(closeBtn).append("<span class='inl-txt'>" + p.t + "</span>");

        if (!readTag(o, "NoTitle"))
            wrap.prepend(title);

        // add btns if any
        if (p.btns) {
            var footer = $('<div></div>');
            wrap.append(footer);
            $.each(p.btns, function (i, e) {
                var btn = $('<button type="button" class="awe-btn inl-btn">' + e.text + '</button>');
                btn.click(function () { e.click.call(popup); });
                footer.append(btn);
            });
        }

        return wrap;
    }

    function gridPageInfo(o) {
        var $grid = o.v;
        var $pageInfo = $('<div class="gridPageInfo"></div>');

        var $footer = $grid.find('.awe-footer');
        if (!$footer.length) return;

        $grid.find('.awe-footer').prepend($pageInfo);

        $grid.on('aweload', function (e, lrs) {
            if (!$(e.target).is($grid)) return;

            var pageSize = lrs.PageSize;
            var first = pageSize * (lrs.Page - 1) + 1;
            var last = first + pageSize - 1;
            if (last > lrs.ItemsCount) last = lrs.ItemsCount;
            $pageInfo.html(first + ' - ' + last + ' ' + format(awem.clientDict.GridInfo, [lrs.ItemsCount]));
        });
    }

    function gridPageSize(o1) {

        function addIfLacks(ni) {
            if (!contains(ni, items)) {
                items.push(ni);
                items.sort(function (a, b) {
                    return a - b;
                });
            }
        }

        if (isMobile()) return;
        var $grid = o1.v;

        var $footer = $grid.find('.awe-footer');
        if (!$footer.length) return;

        $grid.find('.awe-footer').append('<div class="awe-ajaxradiolist-field gridPageSize" ><input id="' + o1.i + 'PageSize" class="awe-val" type="hidden" value="' + o1.ps + '" /><div class="awe-display"></div></div>');

        var items = [5, 10, 20, 50];
        addIfLacks(o1.ps);

        var psi = o1.i + 'PageSize';

        function setPages() {
            return $.map(items, function (val) {
                return { C: val, K: val };
            });
        }

        awe.radioList({ i: psi, nm: psi, df: setPages, l: 1, md: awem.odropdown, tag: { InLabel: "page size: " } });

        o1.data.keys.push("pageSize");
        o1.data.vals.push(psi);
        o1.data.l.push(1);
    }

    function gridInfScroll(o) {
        var $grid = o.v;
        var $content = $grid.find('.awe-content');
        var $tw = $content.children().first();

        function adjustMargin() {
            var diff = (Math.max(($content.height() - $tw.height()) + 20, 20));

            $tw.css('margin-bottom', diff + 'px');
        }

        adjustMargin();

        $content.on('scroll', function () {
            var res = $grid.data('o').lrs;

            var st = $content.scrollTop();
            var sh = $content.prop('scrollHeight') - $content.height();
            var lstv = $content.data('lastsv');

            adjustMargin();

            if (st > sh) {
                st -= awe.scrollw();
            } // deduct horizontal scrollbar height

            if ((lstv + 1) == sh && st == sh) {
                if (res.Page < res.PageCount) {
                    $.when(nextPage()).done(function () {
                        $content.scrollTop(1);
                        st = 1;
                    });
                }
            }
            else if (st == sh) {
                st--;
                $content.scrollTop(st);
            }
            else if ((lstv - 1) == 0 && st == 0) {
                if (res.Page > 1) {
                    $.when(prevPage()).done(function () {
                        st = sh - 1;
                        $content.scrollTop(st);
                    });
                }
            } else if (st == 0) {
                st++;
                $content.scrollTop(st);
            }

            $content.data('lastsv', st);

            function nextPage() {
                return $grid.data('api').load({ oparams: { page: res.Page + 1 } });
            }

            function prevPage() {
                return $grid.data('api').load({ oparams: { page: res.Page - 1 } });
            }
        });
    }

    function isMobileOrTablet() {
        return false;
    }

    var clientDict = {
        GridInfo: "of {0} items",
        Select: 'please select'
    };

    //requires css from here: http://tobiasahlin.com/spinkit (used in prodinner)
    function gridLoading2(o) {
        var $grid = o.v;
        var $mcontent = $grid.find('.awe-mcontent');

        $grid.on('awebeginload', function (e) {
            if ($(e.target).is($grid)) {
                $grid.find('.gridEmpty').remove();
                var $spin = $('<div class="spinCont"><div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div></div>').hide();
                $spin.height($mcontent.height());
                $mcontent.prepend($spin);
                $spin.find('.spinner').css('margin-top', ($mcontent.height() / 2 - 30) + 'px');
                $spin.fadeIn();
            }
        }).on('aweload', function (e, res) {
            if ($(e.target).is($grid)) {
                $mcontent.find('.spinCont:first').fadeOut().remove();
                if (!res.ItemsCount) {
                    $mcontent.prepend($('<div class="gridEmpty">no records found</div>').css('margin-top', ($mcontent.height() / 2 - 70) + 'px'));
                }
            }
        });
    }

    function gridInlineEdit(createUrl, editUrl) {
        return function (o) {
            var savelock = 0;
            var $grid = o.v;
            var api = $grid.data('api');
            var newic = 1;

            api.inlineCreate = function (newModel) {
                newModel = newModel || {};
                var $newRow = $grid.data('api').renderRow(newModel);
                $newRow.addClass('newrow');
                $grid.find('.awe-content .awe-tbody').prepend($newRow);
                $newRow.find('.geditbtn').click();
            };

            $grid.on('click', '.gsavebtn', function () {
                if (savelock) return;
                savelock = 1;
                var $this = $(this);
                var $row = $this.closest('.awe-row');
                var url = $row.hasClass('newrow') ? createUrl : editUrl;

                $.post(url, $row.find(':input').serialize(), function (rdata) {
                    $row.find('.gvalidmsg').empty();
                    var errors = rdata.Errors;
                    if (errors) {
                        for (var k in errors) {
                            var msg = '';
                            for (var i = 0; i < errors[k].length; i++) {
                                msg += '<div class="field-validation-error">' + errors[k][i] + '</div>';
                            }

                            if (!k || !$row.find('.' + k).length) {
                                $grid.find('.gvalidmsg:last').append(msg);
                            } else {
                                $row.find('.' + k).html(msg);
                            }
                        }
                    } else {
                        if (rdata.Item) {
                            $row.remove();
                            var $nrow = $grid.data('api').renderRow(rdata.Item);
                            $grid.find(".awe-content .awe-tbody").prepend($nrow);
                            $nrow.addClass("awe-changing").removeClass("awe-changing", 1000);
                        } else {
                            var item = $row.data('model');
                            var key = $grid.data('o').k;
                            api.update(item[key]);
                        }
                    }
                }).always(function () {
                    savelock = 0;
                });
            })
                .on('click', '.gcancelbtn', function () {
                    var $this = $(this);
                    var $row = $this.closest('.awe-row');
                    if ($row.hasClass('newrow')) {
                        $row.remove();
                    } else {
                        var item = $row.data('model');
                        var key = $grid.data('o').k;
                        api.update(item[key]);
                    }
                })
                .on('click', '.geditbtn', function () {
                    var $this = $(this);
                    var $row = $this.closest('.awe-row');
                    $row.addClass('ginlrow');
                    $row.find('.awe-btn').hide();
                    $row.find('.gcancelbtn,.gsavebtn').show();
                    var $colgroup = $this.closest('.awe-table').find('colgroup');
                    var model = $row.data('model');
                    var gridcfg = $grid.data('o');
                    var columns = gridcfg.columns;
                    var hidden = '';

                    var prefix = gridcfg.i + (model[gridcfg.k] || '');

                    if ($row.hasClass('newrow')) {
                        prefix += 'new' + (newic++);
                    }

                    $.each(columns, function (i, column) {
                        var tdi = $colgroup.find('col[data-i="' + column.i + '"]').index();
                        if (column.Tag) {
                            var tag = column.Tag;
                            var valProp = tag.ValProp || column.P;
                            var modelProp = tag.ModelProp || valProp;
                            var value = model[valProp];
                            value = renderValue(value, valProp);
                            value = value instanceof Array ? JSON.stringify(value) : value;



                            if (tag.Format) {
                                var str = column.Tag.Format;
                                str = str.split('#Value').join(value);
                                str = str.split('#Prefix').join(prefix);
                                if (column.Hid) {
                                    hidden += str;
                                } else {
                                    $row.children().eq(tdi).html(str + '<div class=" gvalidmsg ' + modelProp + '"></div>');
                                }
                            }
                        }
                    });
                    if (hidden) {
                        $row.children().first().append($('<div>' + hidden + '</div>').hide());
                    }
                    $row.find(':tabbable:first').focus();
                    $row.trigger('aweinlineedit');
                });

            function renderValue(val, valProp) {
                if (val == null) val = '';

                if (contains(valProp, o.dates) && val.substr(0, 5) == '/Date') {

                    var dateVal = new Date(parseInt(val.substr(6)));
                    val = $.datepicker.formatDate(o.F, dateVal);
                }

                return val;
            }
        };
    }

    function gridColAutohide(o) {
        function isColumnHidden(column) {
            return !o.sgc && column.Gd || column.Hid;
        }
        
        function autohide(col) {
            return col.Tag && col.Tag.Autohide || 0;
        }

        var $grid = o.v;
        var $columnsSelector = $grid.find('#' + o.i + 'ColSel');

        function autohideColumns() {
            var avw = $grid.find('.awe-hcon').width();
            var eo = $grid.data('o');

            var ahcols = $.grep(eo.columns, function (col) {
                return autohide(col);
            }).sort(function (a, b) { return autohide(b) - autohide(a); }).reverse();

            // unhide autohidden
            $.each(ahcols, function (_, col) {
                if (col.Hid == 2) {
                    col.Hid = 0;
                }
            });

            var contentWidth = o.api.conw();
            if (avw < contentWidth) {
                $.each(ahcols, function (_, col) {
                    if (!isColumnHidden(col)) {
                        col.Hid = 2;
                        contentWidth -= col.W || col.Mw;
                        if (contentWidth <= avw) return false;
                    }
                });
            }

            if ($columnsSelector.length) $columnsSelector.data('api').setItems();
        }

        $grid.on('awebeginload', function (e) {
            if ($(e.target).is($grid)) {
                $grid.data('lrso', 0);
            }
        });

        $grid.on('aweinit', function (e) {
            if ($(e.target).is($grid)) {
                autohideColumns();
            }
        });

        $(window).on('resize domlay', function () {
            autohideColumns();
            
            if (o.lrs && !o.ldg) {
                if ($grid.data('lrso'))
                    $grid.data('api').load();
                else {
                    $grid.data('api').render();
                }
            }
        });
    }

    function gridColSel(o) {
        var $grid = o.v;
        var scid = o.i + 'ColSel';

        $grid.find('.awe-footer').prepend('<div class="awe-ajaxcheckboxlist-field gridColSel" ><input id="' + scid + '" class="awe-val awe-array" type="hidden" /><div class="awe-display"></div></div>');
        
        awe.checkboxList({ i: scid, nm: scid, df: getColumns, l: 1, md: awem.multiselb, tag: { InLabel: "<i class='o'></i><i class='o'></i><i class='o'></i>", NoSelClose: 1 } });

        var colSel = $('#' + scid);

        function setItems() {

            var selColIndx = [];
            $.each($grid.data('o').columns, function (i, col) {
                if (!col.Hid) selColIndx.push(i);
            });

            colSel.val(JSON.stringify(selColIndx)).data('api').render();
        }
        
        colSel.data('api').setItems = setItems;

        $grid.on('aweload', setItems);
        $grid.on('awebeginload', function(e) {
            if ($(e.target).is($grid)) {
                $grid.data('lrso', 0);
            }
        });

        colSel.on('change', function () {
            var reload;

            var colIndxs = $.parseJSON($(this).val() || "[]");
            $.each($grid.data('o').columns, function (i, col) {
                if ($.inArray(i.toString(), colIndxs) == -1 && !(col.Tag && col.Tag.Nohide)) {
                    if (!col.Hid) {
                        col.Hid = 1; //hide column
                        if (col.Gd) {
                            //remove grouped when hiding column
                            col.Gd = 0;
                            reload = 1;
                        }
                    }
                } else {
                    col.Hid = 0;
                }
            });

            var api = $grid.data('api');
            if (reload || $grid.data('lrso'))
                api.load();
            else {
                api.persist();
                api.render();
            }
        });

        function getColumns() {
            var result = [];
            $.each($grid.data('o').columns, function (i, col) {
                var name = col.H || col.P || "col" + (i + 1);
                if (!(col.Tag && col.Tag.Nohide))
                    result.push({ K: i, C: name });
            });

            return result;
        }
    }

    function gridMiniPager(o) {
        return gridAutoMiniPager(o, 1);
    }

    function gridAutoMiniPager(oo, useMiniPager) {
        var $grid = oo.v;
        var $footer = $grid.find('.awe-footer');
        if (!$footer.length) return;
        var api = $grid.data('api');
        var original = api.buildPager;
        var miniPager = function (o) {
            var pageCount = o.lrs.PageCount;
            var page = o.lrs.Page;
            if (page > 0) {
                var result = '';

                result += renderButton(1, icon('glyphicon-backward'), 0, page < 2);
                result += renderButton(page - 1, icon('glyphicon-chevron-left'), 0, page < 2);

                result += renderButton(page, page, 1);

                result += renderButton(page + 1, icon('glyphicon-chevron-right'), 0, pageCount == page);
                result += renderButton(pageCount, icon('glyphicon-forward'), 0, pageCount == page);

                var $pager = $grid.find('.awe-pager');
                $pager.html(result);
                $pager.find('.awe-btn').on('click', function () {
                    o.pg = parseInt($(this).data('p'));
                    $grid.data('api').load();
                });
                setTimeout(function () {
                    api.lay();
                }, 10);
            }
        };

        var pagerType;
        api.buildPager = function (o) {
            if (useMiniPager || $(window).width() < 1000) {
                miniPager(o);
                pagerType = 1;
            } else {
                original(o);
                pagerType = 2;
            }
        };

        if (!useMiniPager) {
            $(window).resize(function () {
                var o = $grid.data('o');
                if (o.lrs) {
                    api.buildPager(o);
                }
            });
        }

        function icon(icls) {
            return '<span class="glyphicon ' + icls + '" aria-hidden="true"></span>';
        }

        function renderButton(page, caption, selected, disabled) {
            var clss = "awe-btn mpbtn ";
            if (selected) clss += "awe-selected ";
            if (disabled) clss += "awe-disabled ";
            var dis = disabled ? "disabled" : '';
            return '<button type="button" class="' + clss + '" data-p="' + page + '" ' + dis + '>' + caption + '</button>';
        }
    }

    return {
        clientDict: clientDict,
        gridInlineEdit: gridInlineEdit,
        gridLoading: gridLoading2,
        gridInfScroll: gridInfScroll,
        gridPageSize: gridPageSize,
        gridPageInfo: gridPageInfo,
        gridColSel: gridColSel,
        gridColAutohide: gridColAutohide,
        buttonGroupRadio: buttonGroupRadio,
        buttonGroupCheckbox: buttonGroupCheckbox,
        bootstrapDropdown: bootstrapDropdown,
        multiselect: multiselect,
        colorDropdown: colorDropdown,
        imgDropdown: imgDropdown,
        combobox: combobox,
        timepicker: timepicker,
        menuDropdown: menuDropdown,
        odropdown: odropdown,
        dropdownPopup: dropdownPopup,
        bootstrapPopup: bootstrapPopup,
        inlinePopup: inlinePopup,
        isMobileOrTablet: isMobileOrTablet,
        multiselb: multiselb,
        gridAutoMiniPager: gridAutoMiniPager,
        gridMiniPager: gridMiniPager
    };
}(jQuery);