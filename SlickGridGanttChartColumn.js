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

    var dateTime = 1000 * 60 * 60 * 24;

    var dispUnitKey = {
        D: {
            value: "D"
        ,
            title: "日"
        ,
            getDate: function (dispBase) {
                return dispBase.clone();
            }
        ,
            getDValue: function (d) {
                return d.toString(" d");
            }
        ,
            nextDate: function (d) {
                return d.addDays(1);
            }
        ,
            checkHoliday: function (d, holidays) {
                var cssClass = "";

                if ($.inArray(d.toString("yyyy/MM/dd"), holidays) >= 0) {
                    cssClass = " sgHolidays";
                }

                return cssClass;
            }
        ,
            getBaseTime: function (dispBase) {
                return dispUnitKey.D.getDate(dispBase).getTime();
            }
        ,
            calcRange: function (graph, dispBaseTime) {
                start = Math.floor((graph.start.getTime() - dispBaseTime) / dateTime);
                duration = graph.duration;

                return {
                    start: start
                ,
                    duration: duration
                };
            }
        ,
            outputYMD: function (htmlY, htmlM, htmlD) {
                var html = "";
                html += "<div style=\"width:100%;height:33%;\">" + htmlY + "</div>";
                html += "<div style=\"width:100%;height:33%;\">" + htmlM + "</div>";
                html += "<div style=\"width:100%;height:33%;\">" + htmlD + "</div>";
                return html;
            }
        ,
            getDispBase: function (dispDuration) {
                return Date.today().addDays(-1 * dispDuration * 0.5);
            }
        }
    ,
        W: {
            value: "W"
        ,
            title: "週"
        ,
            getDate: function (dispBase) {
                var base = dispBase.clone();
                if (base.getDay() != 1) {
                    base = base.moveToDayOfWeek(1, -1);
                }
                return base;
            }
        ,
            getDValue: function (d, format) {
                return d.format(format);
            }
        ,
            nextDate: function (d) {
                return d.addWeeks(1);
            }
        ,
            checkHoliday: function (d, holidays) {
                var cssClass = "";

                return cssClass;
            }
        ,
            getBaseTime: function (dispBase) {
                return dispUnitKey.W.getDate(dispBase).format("%W");
            }
        ,
            calcRange: function (graph, dispBaseTime) {
                var startW = graph.start.format("%W");
                start = startW - dispBaseTime;
                var durationW = graph.start.clone().addDays(graph.duration - 1).format("%W");
                duration = durationW - startW + 1;

                return {
                    start: start
                ,
                    duration: duration
                };
            }
        ,
            outputYMD: function (htmlY, htmlM, htmlD) {
                var html = "";
                html += "<div style=\"width:100%;height:33%;\">" + htmlY + "</div>";
                html += "<div style=\"width:100%;height:33%;\">" + htmlM + "</div>";
                html += "<div style=\"width:100%;height:33%;\">" + htmlD + "</div>";
                return html;
            }
        ,
            getDispBase: function (dispDuration) {
                return Date.today().addWeeks(-4);
            }
        }
    ,
        M: {
            value: "M"
        ,
            title: "月"
        ,
            getDate: function (dispBase) {
                return dispBase.clone().moveToFirstDayOfMonth();
            }
        ,
            getDValue: function (d) {
                return null;
            }
        ,
            nextDate: function (d) {
                return d.addMonths(1);
            }
        ,
            checkHoliday: function (d, holidays) {
                var cssClass = "";

                return cssClass;
            }
        ,
            getBaseTime: function (dispBase) {
                return dispUnitKey.M.getDate(dispBase).toString("M");
            }
        ,
            calcRange: function (graph, dispBaseTime) {
                var startM = graph.start.toString("M");
                start = startM - dispBaseTime;
                var durationM = graph.start.clone().addDays(graph.duration - 1).toString("M");
                duration = durationM - startM + 1;

                return {
                    start: start
                ,
                    duration: duration
                };
            }
        ,
            outputYMD: function (htmlY, htmlM, htmlD) {
                var html = "";
                html += "<div style=\"width:100%;height:50%;\">" + htmlY + "</div>";
                html += "<div style=\"width:100%;height:50%;\">" + htmlM + "</div>";
                return html;
            }
        ,
            getDispBase: function (dispDuration) {
                var result = Date.today();
                result.setMonth(3, 1);
                return result;
            }
        }
    }

    var _hiddenDiv = "<div id=\"spGanttChartColumn_hidden\" style=\"display:none;\">";
    var _dialogDiv = "<div id=\"spGanttChartColumn_dialog\">";
    _dialogDiv += "";
    _dialogDiv += "<table>";
    _dialogDiv += "  <tr>";
    _dialogDiv += "    <th style=\"white-space: nowrap;\">表示単位</th>";
    _dialogDiv += "    <td style=\"white-space: nowrap;\">";
    $.each($.map(dispUnitKey, function (value, key) {
        return key;
    }), function (index, key) {
        _dialogDiv += "<input class=\"spGanttChartColumn_dispUnit\" name=\"spGanttChartColumn_dispUnit\" id=\"spGanttChartColumn_dispUnit_" + key + "\" type=\"radio\" value=\"" + key + "\">";
        _dialogDiv += "<label for=\"spGanttChartColumn_dispUnit_" + key + "\">" + dispUnitKey[key].title + "</label>";
    });
    _dialogDiv += "    </td>";
    _dialogDiv += "  </tr>";
    _dialogDiv += "  <tr>";
    _dialogDiv += "    <th style=\"white-space: nowrap;\">表示開始日</th>";
    _dialogDiv += "    <td style=\"white-space: nowrap;\">";
    _dialogDiv += "      <input style=\"width:8em;\" class=\"spGanttChartColumn_dispBase\" type=\"text\" data-role=\"datebox\">";
    _dialogDiv += "      <button class=\"spGanttChartColumn_dispBase_today\">今日</button>";
    _dialogDiv += "    </td>";
    _dialogDiv += "  </tr>";
    _dialogDiv += "  <tr>";
    _dialogDiv += "    <th style=\"white-space: nowrap;\">表示期間</th>";
    _dialogDiv += "    <td style=\"white-space: nowrap;\">";
    _dialogDiv += "      <input style=\"width:8em;\" class=\"spGanttChartColumn_dispDuration\" type=\"text\">";
    _dialogDiv += "      <input class=\"spGanttChartColumn_dispDuration_auto\" id=\"spGanttChartColumn_dispDuration_auto\" type=\"checkbox\">";
    _dialogDiv += "      <label for=\"spGanttChartColumn_dispDuration_auto\">自動</label>";
    _dialogDiv += "    </td>";
    _dialogDiv += "  </tr>";
    _dialogDiv += "</table>";
    _dialogDiv += "</div>";

    var _defArrowDiv = "<div class=\"sgArrow\">";
    _defArrowDiv += "<span class=\"sgArrowContents\">";
    _defArrowDiv += "</span>";
    _defArrowDiv += "</div>";
    _defArrowDiv = $(_defArrowDiv);

    var _defaults = {
        cellWidth: 30
    ,
        dispDuration: "auto"
    ,
        targetColumnids: []
    ,
        holidays: []
    ,
        dispUnit: dispUnitKey.D
    ,
        arrow: _defArrowDiv
    ,
        arrowFormatter: function (row, cell, value, columnDef, dataContext, graph, index, dispUnit) {
            return $("<div>").css({
                width: "100%"
            ,
                height: "100%"
            ,
                "background-color": "green"
            }).addClass("ui-corner-all");
        }
    ,
        dispUnitWFormat: null
    }
    function GanttChartColumn(options) {
        var _grid;
        var _self = this;
        var _handler = new Slick.EventHandler();
        var _originalRender;
        var underCellLayer = null;
        var upperCellLayer = null;
        var dispDuration = 0;
        var ganttChartData = [];

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
                    case "dispUnit":
                        setDispUnit(_options[key]);
                        break;
                    default:
                        options[key] = _options[key];
                }
            });

            _grid = grid;

            _originalRender = _grid.render;
            _grid.render = render

            _handler
                .subscribe(_grid.onHeaderClick, headerClick)
                .subscribe(_grid.onClick, gridClick)
            ;
        }

        function destroy() {
            _handler.unsubscribeAll();
            _grid.render = _originalRender;
        }

        function render() {
            caclDispDuration();
            _originalRender();
        }

        function formatter(row, cell, value, columnDef, dataContext) {
            var html = "";

            if (row < 0) {
                var htmlY = "", preY = "";
                var htmlM = "", preM = "";
                var htmlD = "";
                var today = options.dispUnit.getDate(Date.today());
                underCellLayer = "";
                upperCellLayer = "";
                var tmpD = options.dispUnit.getDate(options.dispBase);
                var dispUnitWFormat = options.dispUnitWFormat;
                if (!dispUnitWFormat) {
                    dispUnitWFormat = "%W";
                }
                var dayIndex = 0;
                var cellWidth = options.cellWidth;
                for (dayIndex = 0; dayIndex < dispDuration; dayIndex++) {
                    var yyyy = tmpD.toString("yyyy");
                    var yyyyMM = tmpD.toString("yyyyMM");
                    var mValue = tmpD.toString("M");
                    var dValue = options.dispUnit.getDValue(tmpD, dispUnitWFormat);

                    if (preY != yyyy) {
                        preY = yyyy;
                        htmlY += "<span class=\"sgCell\" style=\"width:" + options.cellWidth + "px;\">" + preY + "</span>";
                    } else {
                        htmlY += "<span class=\"sgCell\" style=\"width:" + options.cellWidth + "px;\"><br /></span>";
                    }
                    if (preM != yyyyMM) {
                        preM = yyyyMM;
                        htmlM += "<span class=\"sgCell\" style=\"width:" + options.cellWidth + "px;\">" + mValue + "</span>";
                    } else {
                        htmlM += "<span class=\"sgCell\" style=\"width:" + options.cellWidth + "px;\"><br /></span>";
                    }

                    var cssClass = "sgCell" + options.dispUnit.checkHoliday(tmpD, options.holidays) + checkToday(tmpD, today);
                    if (dayIndex + 1 == dispDuration) {
                        cellWidth = options.cellWidth * 2;
                    }
                    underCellLayer += "<span class=\"" + cssClass + "\" style=\"width:" + cellWidth + "px;\"><br/></span>";
                    upperCellLayer += "<span class=\"sgCell\" style=\"width:" + cellWidth + "px;\" sgdata.index=\"" + dayIndex + "\"><br/></span>";

                    if (dValue) {
                        htmlD += "<span class=\"" + cssClass + "\" style=\"width:" + options.cellWidth + "px;\">" + dValue + "</span>";
                    }
                    tmpD = options.dispUnit.nextDate(tmpD);
                };

                html += "<span style=\"position:absolute;top:0;left:0;right:0;bottom:0;\">";
                html += options.dispUnit.outputYMD(htmlY, htmlM, htmlD);
                html += "</span>";
            } else {
                html += "<span style=\"position:absolute;top:0;left:0;right:0;bottom:0;\">";
                html += "<div style=\"width:100%;height:100%;\">";
                html += underCellLayer;
                html += "</div>";
                html += "</span>";

                var dispBaseTime = options.dispUnit.getBaseTime(options.dispBase);
                if (value) {
                    html += "<span class=\"sgBar\" style=\"position:absolute;top:0;left:0;right:0;bottom:0;padding:2px 0;\">";
                    $.each(value, function (index, graph) {
                        var range = options.dispUnit.calcRange(graph, dispBaseTime);
                        html += makeArrow(row, cell, value, columnDef, dataContext, graph, index, range.start, range.duration);
                    });
                    html += "</span>";
                }

                html += "<span class=\"sgCellLayer\" style=\"position:absolute;top:0;left:0;right:0;bottom:0;\">";
                html += "<div style=\"width:100%;height:100%;\">";
                html += "</div>";
                html += "</span>";

                html += "<span style=\"position:absolute;top:0;left:0;right:0;bottom:0;\">";
                html += "<div style=\"width:100%;height:100%;\">";
                html += outerHTML($(upperCellLayer).attr("sgdata.row", row));
                html += "</div>";
                html += "</span>";
            }

            return html;
        }

        function makeArrow(row, cell, value, columnDef, dataContext, graph, index, start, duration) {
            var bar = options.arrow.clone();
            bar.css("width", duration * options.cellWidth);
            bar.css("margin-left", start * options.cellWidth);
            bar.prop("title", graph.start.toString("yyyy/MM/dd") + "から" + graph.duration + "日間");
            bar.attr("sgdata.row", row);
            bar.attr("sgdata.cell", cell);
            bar.attr("sgdata.start", start);
            bar.attr("sgdata.end", start + duration - 1);
            bar.attr("sgdata.graph", JSON.stringify(graph));
            if (options.arrowFormatter) {
                bar.children(".sgArrowContents").html(options.arrowFormatter(row, cell, value, columnDef, dataContext, graph, index, options.dispUnit));
            }

            return outerHTML(bar);
        }

        function headerClick(e, args) {
            var column = args.column;
            if (checkTargetColumn(column)) {
                getDialog().dialog("open");
            }
        }

        function gridClick(e, args) {
            var row = args.row;
            var col = args.cell;
            var column = _grid.getColumns()[col];

            if (checkTargetColumn(column)) {
                var src = $(e.target);
                var data = _grid.getDataItem(src.attr("sgdata.row"));
                var sgBar = src.closest(".sgGanttChart").children(".sgBar");
                var index = eval(src.attr("sgdata.index"));
                var list = sgBar.children().filter(function () {
                    var sgArrow = $(this);
                    return sgArrow.hasClass("sgArrow") && eval(sgArrow.attr("sgdata.start")) <= index && index <= eval(sgArrow.attr("sgdata.end"));
                });
                if (options.onArrowClick) {
                    options.onArrowClick(row, col, column, data, src.attr("sgdata.row"), src.attr("sgdata.index"), list);
                }
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

        function parseDispUnit(dispUnit) {
            $.each(dispUnitKey, function (index, unit) {
                if (unit.value == dispUnit) {
                    dispUnit = unit;
                }
            });
            return dispUnit;
        }

        function setDispUnit(dispUnit) {
            switch (typeof (dispUnit)) {
                case "string":
                    dispUnit = parseDispUnit(dispUnit);
                    break;
                case "object":
                    break;
                default:
                    throw "Not Support target";
            }
            options.dispUnit = dispUnit;
        }

        function setArrowFormatter(arrowFormatter) {
            options.arrowFormatter = arrowFormatter;
        }

        function setOnArrowClick(onArrowClick) {
            options.onArrowClick = onArrowClick;
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
                dialog.find(".spGanttChartColumn_dispUnit").on("click", function (event) {
                    var dispBase = null;
                    var dispUnit = parseDispUnit($(this).val());

                    if (options.onSelectDispUnit) {
                        dispBase = options.onSelectDispUnit(event, dispUnit, dispDuration);
                    } else {
                        dispBase = dispUnit.getDispBase(dispDuration);
                    }

                    dialog.find(".spGanttChartColumn_dispBase").val(dispBase.toString("yyyy/MM/dd"));
                });
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
                dialog
                    .dialog({
                        autoOpen: false
                    ,
                        resizable: false
                    ,
                        modal: true
                    ,
                        width: "auto"
                    ,
                        height: "auto"
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
                                    setDispUnit($(this).find(".spGanttChartColumn_dispUnit:checked").val());
                                    _grid.render();
                                }
                            }
                        ]
                    })
                    .on("dialogopen.sggcc", function () {
                        dialog.find(".spGanttChartColumn_dispBase").val(options.dispBase.toString("yyyy/MM/dd"));
                    });
                ;
            }
            switch (typeof (options.dispDuration)) {
                case "string":
                    dialog.find(".spGanttChartColumn_dispDuration").val("");
                    dialog.find(".spGanttChartColumn_dispDuration_auto").prop("checked", true);
                    break;
                default:
                    dialog.find(".spGanttChartColumn_dispDuration").val(options.dispDuration);
                    dialog.find(".spGanttChartColumn_dispDuration_auto").prop("checked", false);
            }
            dialog.find("#spGanttChartColumn_dispUnit_" + options.dispUnit.value).prop("checked", true);
            return dialog;
        }

        function checkToday(tmpD, today) {
            var cssClass = "";

            if (Date.equals(tmpD, today)) {
                cssClass = " sgTodays";
            }

            return cssClass;
        }

        function getCellDate(gCol) {
            var tmpD = options.dispUnit.getDate(options.dispBase);

            for (dayIndex = 0; dayIndex < gCol; dayIndex++) {
                tmpD = options.dispUnit.nextDate(tmpD);
            };

            return tmpD;
        }

        function caclDispDuration() {
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
                            dispDuration = Math.round(width / options.cellWidth);
                        }
                    } else {
                        column.width = options.dispDuration * options.cellWidth;
                        column.resizable = false;
                        dispDuration = options.dispDuration;
                    }
                    if (!options.dispBase) {
                        options.dispBase = options.dispUnit.getDispBase(dispDuration);
                    }
                    column.name = formatter(-1, -1, null, column, null);
                    column.formatter = formatter;
                }
            });
            _grid.setColumns(columns);
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
            "setArrow": setArrow
        ,
            "setArrowFormatter": setArrowFormatter
        ,
            "setOnArrowClick": setOnArrowClick
        ,
            "setHoliday": setHoliday
        ,
            "getOptionDialog": getDialog
        ,
            "getCellDate": getCellDate
        });
    }
})(jQuery);
