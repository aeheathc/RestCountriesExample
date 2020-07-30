var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CountryGUI = function (_React$Component) {
    _inherits(CountryGUI, _React$Component);

    function CountryGUI(props) {
        _classCallCheck(this, CountryGUI);

        var _this = _possibleConstructorReturn(this, (CountryGUI.__proto__ || Object.getPrototypeOf(CountryGUI)).call(this, props));

        _this.state = { working: false, errored: false, results: null };
        return _this;
    }

    _createClass(CountryGUI, [{
        key: "execSearch",
        value: function execSearch(str, field) {
            this.setState({ working: true, errored: false, results: null });

            var cg = this;

            $.ajax("api.php", {
                data: { searchStr: str, field: field },
                dataType: "json"
            }).done(function (msg, textStatus, xhrObj) {
                cg.setState({ errored: false, results: { msg: msg, textStatus: textStatus, xhrObj: xhrObj } });
            }).fail(function (xhrObj, statusStr, errorThrown) {
                cg.setState({
                    errored: true,
                    results: { msg: "", textStatus: xhrObj.responseText, xhrObj: "" }
                });
            }).always(function () {
                cg.setState({ working: false });
            });
        }
    }, {
        key: "render",
        value: function render() {
            var _this2 = this;

            var spinnerDisplay = this.state.working ? 'block' : 'none';
            return React.createElement(
                "div",
                { className: "CountryGUI" },
                React.createElement(CountrySearchForm, { onSearch: function onSearch(str, field) {
                        return _this2.execSearch(str, field);
                    } }),
                React.createElement("img", { src: "/static/loading.gif", style: { display: spinnerDisplay } }),
                React.createElement(CountryResults, { results: this.state.results, errored: this.state.errored })
            );
        }
    }]);

    return CountryGUI;
}(React.Component);

var CountrySearchForm = function (_React$Component2) {
    _inherits(CountrySearchForm, _React$Component2);

    function CountrySearchForm(props) {
        _classCallCheck(this, CountrySearchForm);

        var _this3 = _possibleConstructorReturn(this, (CountrySearchForm.__proto__ || Object.getPrototypeOf(CountrySearchForm)).call(this, props));

        _this3.searchStr = React.createRef();
        _this3.searchField = React.createRef();
        return _this3;
    }

    _createClass(CountrySearchForm, [{
        key: "handleSubmit",
        value: function handleSubmit(event) {
            this.props.onSearch(this.searchStr.current.value, this.searchField.current.value);
            event.preventDefault();
        }
    }, {
        key: "render",
        value: function render() {
            var _this4 = this;

            return React.createElement(
                "form",
                { className: "CountrySearchForm", onSubmit: function onSubmit() {
                        _this4.handleSubmit(event);return false;
                    } },
                React.createElement("input", { required: true, placeholder: "enter search term", ref: this.searchStr }),
                React.createElement(
                    "select",
                    { ref: this.searchField, defaultValue: "name" },
                    React.createElement(
                        "option",
                        { value: "name" },
                        "Name           "
                    ),
                    React.createElement(
                        "option",
                        { value: "name_f" },
                        "Name (fulltext)"
                    ),
                    React.createElement(
                        "option",
                        { value: "code" },
                        "Code           "
                    )
                ),
                React.createElement("input", { type: "submit", value: "Search" })
            );
        }
    }]);

    return CountrySearchForm;
}(React.Component);

var CountryResults = function (_React$Component3) {
    _inherits(CountryResults, _React$Component3);

    function CountryResults(props) {
        _classCallCheck(this, CountryResults);

        return _possibleConstructorReturn(this, (CountryResults.__proto__ || Object.getPrototypeOf(CountryResults)).call(this, props));
    }

    _createClass(CountryResults, [{
        key: "render",
        value: function render() {
            if (this.props.results == null) {
                return React.createElement("div", { className: "CountryResults" });
            }

            var msg = this.props.results.msg;
            var textStatus = this.props.results.textStatus;
            var xhrObj = this.props.results.xhrObj;

            if (this.props.errored) {
                return React.createElement(
                    "div",
                    { className: "CountryResults", style: { color: "#F00" } },
                    textStatus
                );
            }

            if (msg.countries.length == 0) {
                return React.createElement(
                    "div",
                    { className: "CountryResults" },
                    "None found."
                );
            }

            return React.createElement(
                "div",
                { className: "CountryResults" },
                "Showing ",
                msg.countries.length,
                " of ",
                msg.total,
                " results.",
                React.createElement(CountryList, { countries: msg.countries }),
                React.createElement(CountrySummary, { regions: msg.regions })
            );
        }
    }]);

    return CountryResults;
}(React.Component);

function CountryList(props) {
    var rows = props.countries.map(function (country) {
        return React.createElement(CountryListItem, { country: country, key: country.alpha2Code });
    });

    return React.createElement(
        "table",
        { className: "CountryList" },
        React.createElement(
            "tbody",
            null,
            React.createElement(
                "tr",
                null,
                React.createElement(
                    "th",
                    null,
                    "Name"
                ),
                React.createElement(
                    "th",
                    null,
                    "Code2"
                ),
                React.createElement(
                    "th",
                    null,
                    "Code3"
                ),
                React.createElement(
                    "th",
                    null,
                    "Flag"
                ),
                React.createElement(
                    "th",
                    null,
                    "Region"
                ),
                React.createElement(
                    "th",
                    null,
                    "Subregion"
                ),
                React.createElement(
                    "th",
                    null,
                    "Population"
                ),
                React.createElement(
                    "th",
                    null,
                    "Languages"
                )
            ),
            rows
        )
    );
}

function CountryListItem(props) {
    var val = props.country;
    return React.createElement(
        "tr",
        { className: "CountryListItem" },
        React.createElement(
            "td",
            null,
            val.name
        ),
        React.createElement(
            "td",
            null,
            val.alpha2Code
        ),
        React.createElement(
            "td",
            null,
            val.alpha3Code
        ),
        React.createElement(
            "td",
            null,
            React.createElement("img", { src: val.flag })
        ),
        React.createElement(
            "td",
            null,
            val.region
        ),
        React.createElement(
            "td",
            null,
            val.subregion
        ),
        React.createElement(
            "td",
            null,
            val.population
        ),
        React.createElement(
            "td",
            null,
            val.languages
        )
    );
}

function CountrySummary(props) {
    var regions = props.regions;
    var rows = [];
    Object.keys(regions).forEach(function (region) {
        var total = regions[region].total;
        rows.push(React.createElement(
            "tr",
            { key: region },
            React.createElement(
                "td",
                null,
                region
            ),
            React.createElement(
                "td",
                null,
                total
            )
        ));
        Object.keys(regions[region].subregions).forEach(function (subregion) {
            rows.push(React.createElement(
                "tr",
                { key: subregion },
                React.createElement(
                    "td",
                    null,
                    "\u21B3 ",
                    subregion
                ),
                React.createElement(
                    "td",
                    null,
                    regions[region].subregions[subregion]
                )
            ));
        });
    });

    return React.createElement(
        "div",
        { className: "CountrySummary" },
        React.createElement(
            "h2",
            null,
            "Summary of all results"
        ),
        React.createElement(
            "table",
            null,
            React.createElement(
                "tbody",
                null,
                React.createElement(
                    "tr",
                    null,
                    React.createElement(
                        "th",
                        null,
                        "Region"
                    ),
                    React.createElement(
                        "th",
                        null,
                        "Countries"
                    )
                ),
                rows
            )
        )
    );
}