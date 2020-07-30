class CountryGUI extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = {working: false, errored: false, results: null };
    }

    execSearch(str, field)
    {
        this.setState({working: true, errored: false, results: null });

        const cg = this;

        $.ajax("api.php", {
			data: {searchStr: str, field: field},
			dataType:"json"
		})
        .done(function(msg, textStatus, xhrObj)
        {
            cg.setState({errored: false, results: {msg: msg, textStatus: textStatus, xhrObj: xhrObj} });
		})
        .fail(function(xhrObj, statusStr, errorThrown)
        {
            cg.setState({
                errored:true,
                results:{msg: "", textStatus: xhrObj.responseText, xhrObj: ""}
            });
		})
		.always(function(){
            cg.setState({working:false});
		});
    }

    render()
    {
        const spinnerDisplay = this.state.working ? 'block' : 'none';
        return (
            <div className="CountryGUI">
             <CountrySearchForm onSearch={(str, field)=>this.execSearch(str, field)} />
             <img src="/static/loading.gif" style={{display: spinnerDisplay}}/>
             <CountryResults results={this.state.results} errored={this.state.errored} />
            </div>
        );
    }
}

class CountrySearchForm extends React.Component
{
    constructor(props)
    {
        super(props);
        this.searchStr = React.createRef();
        this.searchField = React.createRef();
    }

    handleSubmit(event)
    {
        this.props.onSearch(this.searchStr.current.value, this.searchField.current.value);
        event.preventDefault();
    }

    render()
    {
        return (
            <form className="CountrySearchForm" onSubmit={()=>{this.handleSubmit(event);return false;}}>
            <input required placeholder="enter search term" ref={this.searchStr}/>
            <select ref={this.searchField} defaultValue="name">
             <option value="name"   >Name           </option>
             <option value="name_f" >Name (fulltext)</option>
             <option value="code"   >Code           </option>
            </select>
            <input type="submit" value="Search"/>
           </form>
        );
    }
}

class CountryResults extends React.Component
{
    constructor(props)
    {
        super(props);
    }

    render()
    {
        if(this.props.results == null)
        {
            return ( <div className="CountryResults"></div> );
        }

        const msg = this.props.results.msg;
        const textStatus = this.props.results.textStatus;
        const xhrObj = this.props.results.xhrObj;

        if(this.props.errored)
        {
            return ( <div className="CountryResults" style={{color:"#F00"}}>{textStatus}</div> );
        }

        if(msg.countries.length == 0)
        {
            return ( <div className="CountryResults">None found.</div> );
        }

        return (
            <div className="CountryResults">
                Showing {msg.countries.length} of {msg.total} results.
                <CountryList countries={msg.countries} />
                <CountrySummary regions={msg.regions} />
            </div>
        );
    }
}

function CountryList(props)
{
    const rows = props.countries.map((country)=>{ return (
        <CountryListItem country={country} key={country.alpha2Code}/>
    );});

    return (
        <table className="CountryList">
            <tbody>
                <tr><th>Name</th><th>Code2</th><th>Code3</th><th>Flag</th><th>Region</th><th>Subregion</th><th>Population</th><th>Languages</th></tr>
                {rows}
            </tbody>
        </table>
    );
}

function CountryListItem(props)
{
    const val = props.country;
    return (
        <tr className="CountryListItem">
            <td>{val.name}</td>
            <td>{val.alpha2Code}</td>
            <td>{val.alpha3Code}</td>
            <td><img src={val.flag}/>
            </td><td>{val.region}</td>
            <td>{val.subregion}</td>
            <td>{val.population}</td>
            <td>{val.languages}</td>
        </tr>
    );
}

function CountrySummary(props)
{
    const regions = props.regions;
    const rows = [];
    Object.keys(regions).forEach((region)=>{
        const total = regions[region].total;
        rows.push( <tr key={region}><td>{region}</td><td>{total}</td></tr> );
        Object.keys(regions[region].subregions).forEach((subregion)=>{
            rows.push( <tr key={subregion}><td>↳ {subregion}</td><td>{regions[region].subregions[subregion]}</td></tr> );
        });
    });

    return (
        <div className="CountrySummary">
            <h2>Summary of all results</h2>
            <table>
                <tbody>
                <tr><th>Region</th><th>Countries</th></tr>
                {rows}
                </tbody>
            </table>
        </div>
    );
}
