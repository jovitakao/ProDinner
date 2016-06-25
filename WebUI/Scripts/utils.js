utils = function ($) {
    function arreq(a, b) {
        if (a.length != b.length) return false;
        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    function getColVal(str, o) {
        var v = getColsVal(str, o);
        return v ? v.join(' ') : '';
    }

    function getColsVal(name, o) {
        var names = name.split(',');
        return $.map(names, function (c) { return getNestVal(c.split('.'), o); });
    }

    function getNestVal(trail, o) {
        var val = o[trail.shift()];

        if (!trail.length) {
            return val;
        }

        if (!val) return 0;
        return getNestVal(trail, val);
    }

    var Sort = {
        None: 0,
        Asc: 1,
        Desc: 2
    };

    var NodeType =
    {
        Node: 1,
        Items: 2,
        Lazy: 3
    };

    return {
        // grid crud
        delConfirmLoad: function (gridId) {
            return function () {

                if (!gridId) return;
                var $popup = this.p.d;

                var key = $popup.find('[name="key"]').val();

                var rows = $('#' + gridId).data('api').select(key);

                $.map(rows, function (row) {
                    row.addClass('awe-changing', 1000, 'linear');
                });

                $popup.on('aweclose', function () {
                    $.map(rows, function (row) {
                        row.removeClass('awe-changing', 500);
                    });
                });
            };
        },
        itemDeleted: function (gridId) {
            return function (res) {
                var $grid = $("#" + gridId);
                $grid.data('api').select(res["Id"])[0].fadeOut(500, function () {
                    $(this).remove();
                    if (!$grid.find('.awe-row').length) $grid.data('api').load();
                });
                
                $grid.data('lrso', 1);
            };
        },

        itemEdited: function (gridId) {
            return function (item) {
                var $grid = $('#' + gridId);
                var api = $grid.data('api');
                var key = $grid.data('o').k;
                var xhr = api.update(item[key]);
                $.when(xhr).done(function () {

                    var $row = api.select(item[key])[0];
                    var altcl = $row.hasClass("awe-alt") ? "awe-alt" : "";
                    $row.switchClass(altcl, "awe-changing", 1).switchClass("awe-changing", altcl, 1000);
                    
                    $grid.data('lrso', 1);
                });
            };
        },

        itemCreated: function (gridId) {
            return function (item) {
                var $grid = $("#" + gridId);
                var $row = $grid.data('api').renderRow(item);
                $grid.find(".awe-content .awe-tbody").prepend($row);
                $row.addClass("awe-changing").removeClass("awe-changing", 1000);
                
                var data = $grid.data('o').lrs.Data;
                if (data.Items) {
                    data.Items.unshift(item);
                } else {
                    $grid.data('lrso', 1);
                }
            };
        },

        // grid nest
        loadNestPopup: function (popupName) {
            return function (row, nestrow, cell) {
                var key = $(row).closest('.awe-grid').data('o').k;
                var id = $(row).data('model')[key];
                var params = {};
                params[key] = id;
                awe.open(popupName, { params: params, tag: { cont: cell } });
                cell.on('aweclose', function (e) {
                    if ($(e.target).is(cell.find('.awe-popup:first')))
                        nestrow.data('api').close();
                });
            };
        },

        nestCreate: function (gridId, popup) {
            var place = $('#' + gridId + ' .awe-content:first');
            awe.open(popup, { tag: { cont: place } });
        },

        // ajaxlist crud
        itemCreatedAlTbl: function (listId) {
            return function (o) {
                $('#' + listId).parent().find('tbody').prepend(o.Content);
            };
        },

        itemEditedAl: function (listId, key, func) {
            return function (o) {
                $('#' + listId).find('[data-val="' + o[key] + '"]').fadeOut(300, function () {
                    $(this).after($.trim(o.Content)).remove();
                    if (func) func();
                });
            };
        },

        itemDeletedAl: function (listId, key) {
            return function (o) {
                $('#' + listId).find('[data-val="' + o[key] + '"]').fadeOut(300, function () { $(this).remove(); });
            };
        },

        itemCreatedAl: function (listId) {
            return function (o) {
                $('#' + listId).prepend($.trim(o.Content));
            };
        },

        // lookup crud, the InitPopupForm helpers must be called in the SearchForm view
        lookupEdited: function (key) {
            return function (o) {
                this.f.closest('.awe-popup').find('[data-val="' + o[key] + '"]').fadeOut(300, function () { $(this).after(o.Content).remove(); });
            };
        },

        lookupDeleted: function (key) {
            return function (o) {
                this.f.closest('.awe-popup').find('[data-val="' + o[key] + '"]').fadeOut(300, function () { $(this).remove(); });
            };
        },

        lookupCreated: function (o) {
            this.f.closest('.awe-popup').find('.awe-srl').prepend(o.Content);
        },

        lookupTblCreated: function (o) {
            this.f.closest('.awe-popup').find('tbody').prepend(o.Content);
        },

        scheduler: function (id, popupName) {
            var $grid = $('#' + id);
            var $sched = $grid.closest('.scheduler');
            var api = $grid.data('api');
            var $viewType = $sched.find('.viewType .awe-val');

            $sched.find('.prevbtn').click(function () {
                api.load({ oparams: { cmd: 'prev' } });
            });

            $sched.find('.nextbtn').click(function () {
                api.load({ oparams: { cmd: 'next' } });
            });

            $sched.find('.todaybtn').click(function () {
                api.load({ oparams: { cmd: 'today' } });
            });

            $grid
                .on('aweload', function (e, data) {
                    var tag = data.Tag;

                    if (tag.View == 'Agenda' || tag.View == 'Month') {
                        $('.schedBotBar').hide();
                    }
                    else
                        $('.schedBotBar').show();

                    if ($viewType.val() != tag.View) {
                        $viewType.val(tag.View).data('api').render();
                    }

                    $sched.find('.schedDate .awe-val').val(tag.Date);
                    $sched.find('.dateLabel').html(tag.DateLabel);
                })
                .on('click', '.eventTitle', function () {
                    awe.open('edit' + popupName, { params: { id: $(this).parent().data('id') } });
                })
                .on('dblclick', '.schedEvent', function (e) {
                    if (!$(e.target).is('.delEvent'))
                        awe.open('edit' + popupName, { params: { id: $(this).data('id') } });
                })
                .on('click', '.delEvent', function () {
                    awe.open('delete' + popupName, { params: { id: $(this).closest('.schedEvent').data('id') } });
                })
                .on('dblclick', '.timePart', function (e) {
                    if ($(e.target).is('.timePart'))
                        awe.open('create' + popupName, { params: { ticks: $(this).data('ticks'), allDay: $(this).data('allday') } });
                })
                .on('click', '.day', function (e) {
                    if ($(e.target).is('.day')) {
                        api.load({ oparams: { viewType: 'Day', date: $(this).data('date') } });
                    }
                });
        },

        //misc
        refreshGrid: function (gridId) {
            return function () {
                $("#" + gridId).data('api').load();
            };
        },

        getMinutesOffset: function () {
            return { minutesOffset: new Date().getTimezoneOffset() };
        },

        //used for .DataFunc, items is KeyContent[]
        getItems: function (items) {
            return function () {
                return items;
            };
        },

        //http://stackoverflow.com/a/1186309/112100
        serializeObj: function (a, arrays, singles) {
            var o = {};
            arrays = arrays || [];
            $.each(a, function () {
                var val = this.value || '';
                var name = this.name;
                if (o[name] !== undefined) {
                    if (singles && singles.indexOf(name) < 0) {
                        if (!o[name].push) {
                            o[name] = [o[name]];
                        }
                        o[name].push(val);
                    }
                } else {
                    o[name] = $.inArray(name, arrays) == -1 ? val : [val];
                }
            });
            return o;
        },

        getGridParams: function (a) {
            return utils.serializeObj(a, ["SortNames", "SortDirections", "Groups", "Headers"], ["page", "pageSize"]);
        },

        init: function (dateFormat, isMobileOrTablet, decimalSep) {

            if (isMobileOrTablet) {
                awe.ff = function (o) {
                    o.p.d.find(':tabbable').blur();//override jQueryUI dialog autofocus
                };
            }

            //by default jquery.validate doesn't validate hidden inputs
            if ($.validator) {
                $.validator.setDefaults({
                    ignore: []
                });

                setjQueryValidateDateFormat(dateFormat);

                $(function () {
                    //parsing the unobtrusive attributes when we get content via ajax
                    $(document).ajaxComplete(function () {
                        $.validator.unobtrusive.parse(document);
                    });
                });
            }

            if (decimalSep == ',') setjQueryValidateDecimalSepComm();

            utils.setPopup();

            $(function () {
                utils.consistentSearchTxt();
                $(document).ajaxComplete(utils.consistentSearchTxt);
            });

            //remove locaStorage keys from older versions of awesome; you can modify  ppk (awe.ppk = "myapp1_"), current value is "awe2_"
            try {
                for (var key in localStorage) {
                    if (key.indexOf("awe") == 0) {
                        if (key.indexOf(awe.ppk) != 0) {
                            localStorage.removeItem(key);
                        }
                    }
                }
            } catch (err) { }

            function setjQueryValidateDateFormat(format) {
                //setting the correct date format for jquery.validate
                $.validator.addMethod(
                    'date',
                    function (value, element, params) {
                        if (this.optional(element)) {
                            return true;
                        };
                        var result = false;
                        try {
                            $.datepicker.parseDate(format, value);
                            result = true;
                        } catch (err2) {
                            result = false;
                        }
                        return result;
                    },
                    ''
                );
            }

            function setjQueryValidateDecimalSepComm() {
                $.validator.methods.range = function (value, element, param) {
                    var globalizedValue = value.replace(",", ".");
                    return this.optional(element) || (globalizedValue >= param[0] && globalizedValue <= param[1]);
                };

                $.validator.methods.number = function (value, element) {
                    return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:[\s\.,]\d{3})+)(?:[\.,]\d+)?$/.test(value);
                };
            }
        },

        // on ie hitting enter doesn't trigger change, 
        // all searchtxt inputs will trigger change on enter in all browsers
        consistentSearchTxt: function () {
            $('.searchtxt').each(function () {
                if ($(this).data('searchtxth') != 1)
                    $(this).data('searchtxth', 1)
                        .data('myval', $(this).val())
                        .on('change', function (e) {
                            if ($(this).val() != $(this).data('myval')) {
                                $(this).data('myval', $(this).val());
                            } else {
                                e.stopImmediatePropagation();
                            }
                        })
                        .on('keyup', function (e) {
                            if (e.which == 13) {
                                e.preventDefault();
                                if ($(this).val() != $(this).data('myval')) {

                                    $(this).change();
                                }
                            }
                        });
            });
        },
        setPopup: function () {
            var jqueryUIpopup = awe.popup;

            awe.popup = function (o) {
                if (o.tag && o.tag.DropdownPopup) {
                    return awem.dropdownPopup(o);
                } else if (o.tag && o.tag.Inline) {
                    return awem.inlinePopup(o);
                } else {
                    return jqueryUIpopup(o);
                }
            };
        },
        openDropdown: function (opener, popup, cfg) {
            $('#' + popup + '-awein').data('o').f = $(opener);
            awe.open(popup, cfg);
        },
        postfix: function (o) {
            return function (val) {
                return val ? val + ' ' + o : '';
            };
        },

        prefix: function (o) {
            return function (val) {
                return val ? o + val : '';
            };
        },
        percent: function (val) {
            return (parseFloat(val.replace(',', '.')) * 100).toFixed() + ' %';
        },

        gridModelBuilder: function (o, gridParams, items, opt) {
            var treeHeight = 0;
            var key = opt.key;
            var defaultKeySort = opt.defaultKeySort;
            if (defaultKeySort == null) defaultKeySort = Sort.Desc;

            var sortNames = gridParams.SortNames || [];
            var sortDirections = gridParams.SortDirections || [];
            var getChildren = opt.getChildren;
            var dates = opt.dates || [];
            var paging = gridParams.Paging != null ? gridParams.Paging : 1;

            var page = gridParams.page || 1;
            var lazyKey = gridParams.Key;
            var getItem = opt.getItem;
            var pageCount;
            var itemsCount;

            if (!o.prevsd) {
                o.prevsd = [];
                o.prevsn = [];
            }

            function sort(uitems) {
                if (sortNames.length) {
                    var getfunc = function (sname, a) {
                        return a[sname];
                    };
                    var getfuncs = $.map(sortNames, function (sname) {
                        if (sname.indexOf(',') + 1 || sname.indexOf('.') + 1)
                            return getColVal;
                        return getfunc;
                    });

                    uitems.sort(function (a, b) {
                        var res = 0;

                        $.each(sortNames, function (i, sname) {
                            var direction = sortDirections[i];
                            var func = getfuncs[i];
                            var sa = func(sname, a), sb = func(sname, b);
                            {
                                if (typeof sa == "number")
                                    res = sa - sb;
                                else
                                    res = (sa || '').localeCompare(sb);
                            }

                            if (direction == 'desc') res = -res;
                            if (res != 0) return false;
                        });

                        return res;
                    });
                }
            }

            function buildData(ignoreGroups) {
                var gridModel = buildGroupView(pageItems, ignoreGroups ? [] : gridParams.Groups, gridParams.Headers, 0, "$" + page);

                return gridModel;
            }

            function buildGroupView(groupItems, groupColumns, groupNames, groupIndex, keyPart) {
                function addGroupView() {
                    var first = groupViewItems[0];
                    var val = getColVal(groupColumns[groupIndex], first);

                    var info =
                    {
                        Items: groupViewItems,
                        Column: groupColumns[groupIndex],
                        Header: groupNames[groupIndex],
                        Level: lvl
                    };

                    var newKey = makeKey(keyPart, groupIndex, group, val);

                    var gr = buildGroupView(groupViewItems, groupColumns, groupNames, groupIndex + 1, newKey);
                    gr.Header = makeHeader(info);
                    gr.Header.Key = gr.Header.Key || newKey;
                    gr.Footer = makeFooter(info);

                    groupViews.push(gr);
                }

                var result = {};
                if (groupIndex == 0)
                    result.Footer = makeFooter({ Items: groupItems });

                var lvl = groupIndex + 1;
                if (groupIndex == groupColumns.length) {
                    if (getChildren == null || !groupItems.length) {
                        result.Items = $.map(groupItems, map);
                    }
                    else {

                        //set items or groups
                        buildNode(result, groupItems, key, lvl, 0);
                    }
                }
                else {
                    var groupViews = [];
                    var groupViewItems = [];

                    var group = groupColumns[groupIndex];
                    var i = 0;
                    while (i != groupItems.length) {
                        var head = groupItems[i];

                        if (groupViewItems.length == 0)
                            groupViewItems.push(head);

                        else if (areInSameGroup(group, groupViewItems[0], head))
                            groupViewItems.push(head);

                        else {

                            addGroupView();

                            groupViewItems = [head];
                        }

                        i++;
                    }

                    if (groupViewItems.length != 0) {
                        addGroupView();
                    }

                    result.Groups = groupViews;
                }

                return result;
            }

            function buildNode(result, groupItems, keyPart, level, nodeLevel) {
                if (nodeLevel > treeHeight) treeHeight = nodeLevel;

                var groups = [];

                $.each(groupItems, function (i, groupItem) {
                    var children = getChildren(groupItem, nodeLevel + 1) || [];
                    var isLazyNode = children == "lazy";

                    // if item has no children or lazy filter it, and ignore if filtered out

                    if (!isLazyNode && children.length > 1) {
                        //sort children
                        sort(children);
                    }

                    if (isLazyNode || children.length) {
                        var keyValue = getColVal(key, groupItem);
                        var newKey = makeNodeKey(keyValue);

                        var nodeGroup = {};
                        nodeGroup.Nt = isLazyNode ? NodeType.Lazy : NodeType.Node;
                        nodeGroup.Header = makeHeader({
                            Items: children,
                            NodeItem: groupItem,
                            Level: level,
                            NodeLevel: nodeLevel,
                            Lazy: isLazyNode
                        });

                        nodeGroup.Header.Key = nodeGroup.Header.Key || newKey;

                        if (isLazyNode) {
                            nodeGroup.Header.Collapsed = true;
                        }
                        else {
                            buildNode(nodeGroup, children, newKey, level, nodeLevel + 1);
                            // if returns true we don't filter it, otherwise we add it to the must be filtered collection
                        }

                        groups.push(nodeGroup);
                    }
                    else {
                        // leaf
                        if (nodeLevel > treeHeight) treeHeight = nodeLevel;

                        if (groups.length == 0 || groups[groups.length - 1].Nt != NodeType.Items) {
                            groups.push({ Items: [map(groupItem)], Nt: NodeType.Items });
                        }
                        else {
                            var last = groups[groups.length - 1];
                            last.Items.push(map(groupItem));
                        }
                    }
                });

                if (groups.length == 1 && groups[0].Nt == NodeType.Items) {
                    result.Items = groups[0].Items;
                }
                else {
                    result.Groups = groups;
                }

                // filter 
                // return true if there's items after filtering
            }

            function makeNodeKey(val) {
                return "$" + encodeURIComponent(val);
            }

            function getStrValN(propName, obj) {
                var v = getColVal(propName, obj);
                if (dates.indexOf(propName) + 1) {
                    if (v.substr(0, 5) == '/Date') {
                        var dateVal = new Date(parseInt(v.substr(6)));
                        v = $.datepicker.formatDate(o.F, dateVal);
                    }
                }
                return v;
            }

            var map = opt.map || function (it) { return it; };

            var makeFooter = opt.makeFooter || function () { return null; };

            var areInSameGroup = opt.areInSameGroup || function (path, g1, g2) {
                if (path.indexOf(",") == -1) return getColVal(path, g1) == getColVal(path, g2);
                var props = path.split(',');

                var result = 1;
                $.each(props, function (i, prop) {
                    result = result && (getColVal(prop, g1) == getColVal(prop, g2));
                });

                return result;
            };

            var makeKey = opt.makeKey || function (gkey, groupIndex, group, val) {
                return gkey + "$" + groupIndex + group + encodeURIComponent(val); //make $0gkey$1gkey2
            };

            var makeHeader = opt.makeHeader || function (info) {
                if (info.NodeItem) {
                    return { Item: map(info.NodeItem) };
                }

                var val = getStrValN(info.Column, info.Items[0]);
                return {
                    Content: info.Header + ": " + val,
                    Collapsed: 0
                };
            };

            if (opt.getChildren && !opt.key) {
                throw "key should have value when GetChildren is set";
            }

            var pageSize = parseInt(gridParams.pageSize || 10);
            if (pageSize < 1) pageSize = 10;
            var pageItems = items;

            if ((!sortNames.length) && key && defaultKeySort != Sort.None) {
                // default sorting
                sortNames = [key];
                sortDirections = [defaultKeySort == Sort.Asc ? "asc" : "desc"];
            }

            var fitems = items;
            if (!lazyKey) {
                // sort
                if (opt.forceSort || !(arreq(sortNames, o.prevsn) && arreq(sortDirections, o.prevsd))) {
                    sort(items);
                }

                o.prevsn = sortNames;
                o.prevsd = sortDirections;

                if (opt.filter) {
                    fitems = opt.filter(items);
                }

                if (paging) {

                    itemsCount = fitems.length;
                    pageCount = Math.ceil(itemsCount / pageSize);

                    if (page > pageCount) {
                        page = 1;
                    }

                    var skip = (page - 1) * pageSize;
                    pageItems = fitems.slice(skip, skip + pageSize);
                } else {
                    pageItems = fitems.slice(0);
                }
            } else {
                // Lazy Key load
                var list = [];
                if (!getItem) {
                    throw "getItem func needs to be defined (used by Lazy Loading and api.update)";
                }

                var item = getItem();
                if (item) list.push(item);
                pageItems = list;
            }

            if (!fitems) fitems = items;
            gridParams.Groups = gridParams.Groups || [];

            var data = buildData(lazyKey);

            return {
                Data: data,
                Dates: dates,
                PageCount: pageCount,
                ItemsCount: itemsCount,
                PageSize: pageSize,
                Page: paging ? page : -1,
                GroupCount: gridParams.Groups.length,
                Th: treeHeight,
                Key: key,
                Fr: opt.FrozenRows
            };
        }
    };
}(jQuery);