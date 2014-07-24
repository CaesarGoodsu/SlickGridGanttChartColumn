(function ($) {
    // register namespace
    $.extend(true, window, {
        "Slick": {
            "Plugins": {
                "GanttChartColumn": GanttChartColumn
            ,
            }
        }
    });

    var dispUnitKey = {
        D: {
            value: "D"
        ,
            title: "日"
        }
    ,
        W: {
            value: "W"
        ,
            title: "週"
        }
    ,
        M: {
            value: "M"
        ,
            title: "月"
        }
    }

    var _hiddenDiv = "<div id=\"spGanttChartColumn_hidden\" style=\"display:none;\">";
    var _dialogDiv = "<div id=\"spGanttChartColumn_dialog\">";
    _dialogDiv += "";
    _dialogDiv += "<table>";
    _dialogDiv += "  <tr>";
    _dialogDiv += "    <th>表示開始日</th>";
    _dialogDiv += "    <td><input class=\"spGanttChartColumn_dispBase\" type=\"text\" data-role=\"datebox\"><button class=\"spGanttChartColumn_dispBase_today\">今日</button></td>";
    _dialogDiv += "  </tr>";
    _dialogDiv += "  <tr>";
    _dialogDiv += "    <th>表示期間</th>";
    _dialogDiv += "    <td>";
    _dialogDiv += "      <input class=\"spGanttChartColumn_dispDuration\" type=\"text\">";
    _dialogDiv += "      <input class=\"spGanttChartColumn_dispDuration_auto\" id=\"spGanttChartColumn_dispDuration_auto\" type=\"checkbox\">";
    _dialogDiv += "      <label for=\"spGanttChartColumn_dispDuration_auto\">自動</label>";
    _dialogDiv += "    </td>";
    _dialogDiv += "  </tr>";
    _dialogDiv += "  <tr>";
    _dialogDiv += "    <th>表示単位</th>";
    _dialogDiv += "    <td>";
    $.each($.map(dispUnitKey, function (value, key) {
        return key;
    }), function (index, key) {
        _dialogDiv += "<input class=\"spGanttChartColumn_dispUnit\" name=\"spGanttChartColumn_dispUnit\" id=\"spGanttChartColumn_dispUnit_" + key + "\" type=\"radio\" value=\"" + key + "\">";
        _dialogDiv += "<label for=\"spGanttChartColumn_dispUnit_" + key + "\">" + dispUnitKey[key].title + "</label>";
    });
    _dialogDiv += "    </td>";
    _dialogDiv += "  </tr>";
    _dialogDiv += "</table>";
    _dialogDiv += "</div>";

    var _defArrowDiv = "<div class=\"sgArrow\" style=\"position:relative;box-sizing:border-box;\">";
    _defArrowDiv += "<img src=\"./Content/images/left_arrow.png\" style=\"box-sizing: border-box;height:5px;position:absolute;left:0;width:5px;\">";
    _defArrowDiv += "<img src=\"./Content/images/cylinder.png\" style=\"box-sizing: border-box;height:5px;position:absolute;width:100%;margin-left:5px;padding-right:10px;\">";
    _defArrowDiv += "<img src=\"./Content/images/right_arrow.png\" style=\"box-sizing: border-box;height:5px;position:absolute;right:0;width:5px;\">";
    _defArrowDiv += "</div>";
    _defArrowDiv = $(_defArrowDiv);

    var _defaults = {
        dispBase: Date.today()
    ,
        cellWidth: 30
    ,
        dispDuration: "auto"
    ,
        targetColumnids: []
    ,
        holidays: []
    ,
        dispUnit: dispUnitKey.D.value
    ,
        arrow: _defArrowDiv
    }
    function GanttChartColumn(options) {
        var _grid;
        var _self = this;
        var _handler = new Slick.EventHandler();
        var _originalRender;
        var borderD = null;
        var dispDuration = 0;

        function init(grid) {
            var _options = options;
            options = $.extend(true, {}, _defaults);
            $.each($.map(_options, function (value, key) {
                return key;
            }), function (index, key) {
                switch (key) {
                    case "arrow":
                        setArrow(_options[key]);
                        break;
                    default:
                        options[key] = _options[key];
                }
            });

            _grid = grid;

            _originalRender = _grid.render;
            _grid.render=render

            _handler
                .subscribe(_grid.onHeaderClick, headerClick)
            ;
        }

        function destroy() {
            _handler.unsubscribeAll();
            _grid.render = _originalRender;
        }

        function render() {
            var columns = _grid.getColumns();
            $.each(columns, function (index, column) {
                if (checkTargetColumn(column)) {
                    var width = 0;
                    if (options.dispDuration === "auto") {
                        if (!column.resizable) {
                            column.resizable = true;
                            _grid.autosizeColumns();
                        }
                        width = column.width;
                        if (width > 0) {
                            dispDuration = Math.floor(width / options.cellWidth);
                        }
                    } else {
                        column.width = options.dispDuration * options.cellWidth;
                        column.resizable = false;
                        dispDuration = options.dispDuration;
                    }
                    column.name = formatter(-1, -1, null, column, null);
                    column.formatter = formatter;
                }
            });
            _grid.setColumns(columns);
            _originalRender();
            _grid.getCanvases().find(".sgArrow").on("click", function (event) {
                var node = $(this);
                var data = {
                    row: node.attr("sgdata.row")
                ,
                    cell: node.attr("sgdata.cell")
                ,
                    graph: {
                        start: new Date(node.attr("sgdata.graph.start"))
                    ,
                        duration: node.attr("sgdata.graph.duration")
                    }
                };
                if (options.onArrowClick) {
                    options.onArrowClick(data.row, data.cell, data.graph);
                }
            });
        }

        function formatter(row, cell, value, columnDef, dataContext) {
            var html = "";

            switch (options.dispUnit) {
                case dispUnitKey.D.value:
                    html = formatterD(row, cell, value, columnDef, dataContext);
                    break;
                case dispUnitKey.W.value:
                    html = formatterW(row, cell, value, columnDef, dataContext);
                    break;
                case dispUnitKey.M.value:
                    html = formatterM(row, cell, value, columnDef, dataContext);
                    break;
            }

            return html;
        }

        function formatterD(row, cell, value, columnDef, dataContext) {
            var html = "";

            if (row < 0) {
                var htmlY = "", preY = "";
                var htmlM = "", preM = "";
                var htmlD = "";
                borderD = "";
                var tmpD = options.dispBase.clone();
                var endD = tmpD.clone().addDays(dispDuration);
                do {
                    if (preY != tmpD.toString("yyyy")) {
                        preY = tmpD.toString("yyyy");
                        htmlY += "<span class=\"sgCell\" style=\"width:" + options.cellWidth + "px;\">" + preY + "</span>";
                    } else {
                        htmlY += "<span class=\"sgCell\" style=\"width:" + options.cellWidth + "px;\"><br /></span>";
                    }
                    if (preM != tmpD.toString("yyyyMM")) {
                        preM = tmpD.toString("yyyyMM");
                        htmlM += "<span class=\"sgCell\" style=\"width:" + options.cellWidth + "px;\">" + tmpD.toString("M") + "</span>";
                    } else {
                        htmlM += "<span class=\"sgCell\" style=\"width:" + options.cellWidth + "px;\"><br /></span>";
                    }

                    var cssClass = "sgCell";
                    if ($.inArray(tmpD.toString("yyyy/MM/dd"), options.holidays) >= 0) {
                        cssClass += " sgHolidays";
                    }
                    borderD += "<span class=\"" + cssClass + "\" style=\"width:" + options.cellWidth + "px;\"><br/></span>";
                    htmlD += "<span class=\"sgCell\" style=\"width:" + options.cellWidth + "px;\">" + tmpD.toString(" d") + "</span>";
                    tmpD.addDays(1);
                } while (tmpD < endD);
                html += "<span style=\"position:absolute;top:0;left:0;right:0;bottom:0;\">";

                html += "<div style=\"width:100%;height:33%;\">" + htmlY + "</div>";
                html += "<div style=\"width:100%;height:33%;\">" + htmlM + "</div>";
                html += "<div style=\"width:100%;height:33%;\">" + htmlD + "</div>";

                html += "</span>";
            } else {
                html += "<span style=\"position:absolute;top:0;left:0;right:0;bottom:0;\">";
                html += "<div style=\"width:100%;height:100%;\">";
                html += borderD;
                html += "</div>";
                html += "</span>";

                var dispBaseTime = options.dispBase.getTime();
                var dateTime = 1000 * 60 * 60 * 24;
                if (value) {
                    html += "<span style=\"position:absolute;top:0;left:0;right:0;bottom:0;padding:2px 0;\">";
                    $.each(value, function (index, graph) {
                        var start = Math.floor((graph.start.getTime() - dispBaseTime) / dateTime);
                        var duration = graph.duration;
                        html += makeArrow(row, cell, graph, start, duration);
                    });
                    html += "</span>";
                }
            }

            return html;
        }

        function formatterW(row, cell, value, columnDef, dataContext) {
            var html = "";

            if (row < 0) {
                var htmlY = "", preY = "";
                var htmlM = "", preM = "";
                var htmlD = "";
                borderD = "";
                var tmpD = options.dispBase.clone();
                var endD = tmpD.clone().addWeeks(dispDuration);
                do {
                    if (preY != tmpD.toString("yyyy")) {
                        preY = tmpD.toString("yyyy");
                        htmlY += "<span class=\"sgCell\" style=\"width:" + options.cellWidth + "px;\">" + preY + "</span>";
                    } else {
                        htmlY += "<span class=\"sgCell\" style=\"width:" + options.cellWidth + "px;\"><br /></span>";
                    }
                    if (preM != tmpD.toString("yyyyMM")) {
                        preM = tmpD.toString("yyyyMM");
                        htmlM += "<span class=\"sgCell\" style=\"width:" + options.cellWidth + "px;\">" + tmpD.toString("M") + "</span>";
                    } else {
                        htmlM += "<span class=\"sgCell\" style=\"width:" + options.cellWidth + "px;\"><br /></span>";
                    }
                    borderD += "<span class=\"sgCell\" style=\"width:" + options.cellWidth + "px;\"><br/></span>";
                    htmlD += "<span class=\"sgCell\" style=\"width:" + options.cellWidth + "px;\">" + tmpD.format("%W") + "</span>";
                    tmpD.addWeeks(1);
                } while (tmpD < endD);
                html += "<span style=\"position:absolute;top:0;left:0;right:0;bottom:0;\">";

                html += "<div style=\"width:100%;height:33%;\">" + htmlY + "</div>";
                html += "<div style=\"width:100%;height:33%;\">" + htmlM + "</div>";
                html += "<div style=\"width:100%;height:33%;\">" + htmlD + "</div>";

                html += "</span>";
            } else {
                html += "<span style=\"position:absolute;top:0;left:0;right:0;bottom:0;\">";
                html += "<div style=\"width:100%;height:100%;\">";
                html += borderD;
                html += "</div>";
                html += "</span>";

                var dispBaseTime = options.dispBase.format("%W");
                if (value) {
                    html += "<span style=\"position:absolute;top:0;left:0;right:0;bottom:0;padding:2px 0;\">";
                    $.each(value, function (index, graph) {
                        var startW = graph.start.format("%W");
                        var start = startW - dispBaseTime;
                        var durationW = graph.start.clone().addDays(graph.duration).format("%W");
                        var duration = durationW - startW + 1;
                        html += makeArrow(row, cell, graph, start, duration);
                    });
                    html += "</span>";
                }
            }

            return html;
        }

        function formatterM(row, cell, value, columnDef, dataContext) {
            var html = "";

            if (row < 0) {
                var htmlY = "", preY = "";
                var htmlM = "", preM = "";
                var htmlD = "";
                borderD = "";
                var tmpD = options.dispBase.clone();
                var endD = tmpD.clone().addMonths(dispDuration);
                do {
                    if (preY != tmpD.toString("yyyy")) {
                        preY = tmpD.toString("yyyy");
                        htmlY += "<span class=\"sgCell\" style=\"width:" + options.cellWidth + "px;\">" + preY + "</span>";
                    } else {
                        htmlY += "<span class=\"sgCell\" style=\"width:" + options.cellWidth + "px;\"><br /></span>";
                    }
                    if (preM != tmpD.toString("yyyyMM")) {
                        preM = tmpD.toString("yyyyMM");
                        htmlM += "<span class=\"sgCell\" style=\"width:" + options.cellWidth + "px;\">" + tmpD.toString("M") + "</span>";
                    } else {
                        htmlM += "<span class=\"sgCell\" style=\"width:" + options.cellWidth + "px;\"><br /></span>";
                    }
                    borderD += "<span class=\"sgCell\" style=\"width:" + options.cellWidth + "px;\"><br/></span>";
                    tmpD.addMonths(1);
                } while (tmpD < endD);
                html += "<span style=\"position:absolute;top:0;left:0;right:0;bottom:0;\">";

                html += "<div style=\"width:100%;height:50%;\">" + htmlY + "</div>";
                html += "<div style=\"width:100%;height:50%;\">" + htmlM + "</div>";

                html += "</span>";
            } else {
                html += "<span style=\"position:absolute;top:0;left:0;right:0;bottom:0;\">";
                html += "<div style=\"width:100%;height:100%;\">";
                html += borderD;
                html += "</div>";
                html += "</span>";

                var dispBaseTime = options.dispBase.toString("M");
                if (value) {
                    html += "<span style=\"position:absolute;top:0;left:0;right:0;bottom:0;padding:2px 0;\">";
                    $.each(value, function (index, graph) {
                        var startM = graph.start.toString("M");
                        var start = startM - dispBaseTime;
                        var durationM = graph.start.clone().addDays(graph.duration).toString("M");
                        var duration = durationM - startM + 1;
                        html += makeArrow(row, cell, graph, start, duration);
                    });
                    html += "</span>";
                }
            }

            return html;
        }

        function makeArrow(row, cell, graph, start, duration) {
            var bar = options.arrow.clone();
            bar.css("width", duration * options.cellWidth);
            bar.css("margin-left", start * options.cellWidth);
            bar.prop("title", graph.start.toString("yyyy/MM/dd") + "から" + graph.duration + "日間");
            bar.attr("sgdata.row",row);
            bar.attr("sgdata.cell", cell);
            bar.attr("sgdata.graph.start", graph.start.toString("yyyy/MM/dd"));
            bar.attr("sgdata.graph.duration", graph.duration);

            return outerHTML(bar);
        }

        function headerClick(e, args) {
            var column = args.column;
            if (checkTargetColumn(column)) {
                getDialog().dialog("open");
            }
        }

        function checkTargetColumn(column) {
            return $.inArray(column.id, options.targetColumnids) >= 0;
        }

        function setFrom(from) {
            switch (typeof (from)) {
                case "string":
                    from = Date.parse(from);
                    break;
            }
            options.dispBase = from;
        }

        function setDuration(duration) {
            options.dispDuration = duration;
        }

        function setArrow(arrow) {
            switch (typeof (arrow)) {
                case "string":
                    arrow = $(arrow);
                    break;
                case "object":
                    break;
                default:
                    throw "Not Support target";
            }
            if (!arrow.hasClass("sgArrow")) {
                arrow.addClass("sgArrow");
            }
            options.arrow = arrow;
        }

        function setHoliday(holidays) {
            options.holidays = holidays;
        }

        function getDialog() {
            var hidden = $("#spGanttChartColumn_hidden");
            if (!hidden.length) {
                hidden = $(_hiddenDiv).appendTo("body");
            }
            var dialog = $("#spGanttChartColumn_dialog");
            if (!dialog.length) {
                dialog = $(_dialogDiv).appendTo(hidden);
                dialog.find(".spGanttChartColumn_dispBase_today").on("click", function (event) {
                    dialog.find(".spGanttChartColumn_dispBase").val(Date.today().toString("yyyy/MM/dd"));
                });
                dialog.find(".spGanttChartColumn_dispDuration_auto").on("click", function (event) {
                    var txt = dialog.find(".spGanttChartColumn_dispDuration");
                    txt.prop("disabled", $(this).is(":checked"));
                    if ($(this).is(":checked")) {
                        txt.val("");
                    } else {
                        txt.focus();
                    }
                });
                dialog.dialog({
                    autoOpen: false
                ,
                    resizable: false
                ,
                    modal: true
                ,
                    title: "チャート操作"
                ,
                    buttons: [
                        {
                            text: "適用"
                        ,
                            click: function () {
                                $(this).dialog("close");
                                setFrom($(this).find(".spGanttChartColumn_dispBase").val());
                                if ($(this).find(".spGanttChartColumn_dispDuration_auto").is(":checked")) {
                                    setDuration("auto");
                                } else {
                                    setDuration(eval($(this).find(".spGanttChartColumn_dispDuration").val()));
                                }
                                options.dispUnit = $(this).find(".spGanttChartColumn_dispUnit:checked").val();
                                _grid.render();
                            }
                        }
                    ]
                });
            }
            dialog.find(".spGanttChartColumn_dispBase").val(options.dispBase.toString("yyyy/MM/dd"));
            switch (typeof (options.dispDuration)) {
                case "string":
                    dialog.find(".spGanttChartColumn_dispDuration").val("");
                    dialog.find(".spGanttChartColumn_dispDuration_auto").prop("checked", true);
                    break;
                default:
                    dialog.find(".spGanttChartColumn_dispDuration").val(options.dispDuration);
                    dialog.find(".spGanttChartColumn_dispDuration_auto").prop("checked", false);
            }
            dialog.find("#spGanttChartColumn_dispUnit_" + options.dispUnit).prop("checked", true);
            return dialog;
        }

        function outerHTML(target) {
            return jQuery("<p>").append(target).html();
        }

        // Public API
        $.extend(this, {
            "init": init
        ,
            "destroy": destroy
        ,
            "setFrom": setFrom
        ,
            "setDuration": setDuration
        ,
            "setBar": setArrow
        ,
            "setHoliday": setHoliday
        ,
            "getOptionDialog": getDialog
        });
    }
})(jQuery);
