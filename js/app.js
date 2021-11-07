const COLORS = {
    confirmed: '#ff0000',
    recovered: '#008000',
    deaths: '#373c43',
    
    serious_critical: '#D830EB',
    new_cases: '#FF6178',
    total_cases_per_1m: '#FEBC3B',
    total_deaths_per_1m: '#373c43'
}

const CASE_STATUS = {
    confirmed: 'confirmed',
    recovered: 'recovered',
    deaths: 'deadths',
    serious_critical: 'Serious_Critical',
    new_cases: 'NewCases',
    total_cases_per_1m: 'TotCases_1M_Pop',
    total_deaths_per_1m: 'Deaths_1M_pop'
}

let body = document.querySelector('body')

let countries_list

let all_time_chart, days_chart, recover_rate_chart

let summaryData

let summary

let summary_countries

window.onload = async () => {
    console.log('ready . . .')
    // Only init chart on page loaded fisrt time
    initTheme()

    initCountryFilter()

    await initAllTimesChart()

    await initRecoveryRate()

    await loadData('World')

    await loadCountrySelectList()

    document.querySelector('#country-select-toggle').onclick = () => {
        document.querySelector('#country-select-list').classList.toggle('active')
    }
}

loadData = async (country) => {
    startLoading()
    
    await loadSummary(country)
    
    await loadAllTimeChart(country)
    
    endLoading()

}

startLoading = () => {
    body.classList.add('loading')
}

endLoading = () => {
    body.classList.remove('loading')
}

isGlobal = (country) => {
    return country === 'World'
}

numberWithCommas = (x) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

numberWithCommas2 = (x) => {
    return x.replace(/,/g, '')
}

showConfirmedTotal = (total) => {
    document.querySelector('#confirmed-total').textContent = numberWithCommas(total)
}

showRecoveredTotal = (total) => {
    document.querySelector('#recovered-total').textContent = numberWithCommas(total)
}

showDeathsTotal = (total) => {
    document.querySelector('#death-total').textContent = numberWithCommas(total)
}

showRanking = (rank) => {
    document.querySelector('.country-ranking span').textContent = rank.toString()
}

showDate = () => {
    let d = new Date;
    document.querySelector('.date-updated span').textContent = d.toLocaleDateString()
}
loadSummary = async (country) => {

    //country = slug

    summaryData = await covidApi.getSummary()

    summary = summaryData.find(e => e['Country']==='World')
    //list name of country
    countries_list = summaryData.map(e => e["Country"])

    //sort list name
    countries_list.sort((a,b) => {
        if(a < b) { return -1; }
        if(a > b) { return 1; }
        return 0
    })

    let indexOfWorld
    countries_list.find(function(e,index) {
        indexOfWorld=index
        return e==='Total:'
    })
    delete countries_list[indexOfWorld]

    countries_list.find(function(e,index) {
        indexOfWorld=index
        return e==='World'
    })
    delete countries_list[indexOfWorld]
    
    //add world select
    countries_list.unshift('World')


    if (!isGlobal(country)) {
        summary_country = summaryData.find(function(e) {
           return e["Country"] === country
        })
        console.log(summary_country)
        showConfirmedTotal(numberWithCommas(summary_country["TotalCases"]))
        showRecoveredTotal(numberWithCommas(summary_country["TotalRecovered"]))
        showDeathsTotal(numberWithCommas(summary_country["TotalDeaths"]))

        //Load recover rate country
        await loadRecoveryRate(Math.round(summary_country["Recovery_Proporation"]))
    } else {

        showConfirmedTotal(numberWithCommas(summary["TotalCases"]))
        showRecoveredTotal(numberWithCommas(summary["TotalRecovered"]))
        showDeathsTotal(numberWithCommas(summary["TotalDeaths"]))

        //Load recover rate world
        await loadRecoveryRate(Math.round(summary["Recovery_Proporation"]))
    }


    //Load countries table

    let summary_countries = summaryData
    let indexOfCountry

    summary_countries.find((e,i) => {
        indexOfCountry=i
        return e['Country']==='World'
    })
    delete summary_countries[indexOfCountry]

    let casesByCountries = summary_countries.sort((a, b) => b["TotalCases"] - a["TotalCases"])

    let table_countries_body = document.querySelector('#table-contries tbody')
    table_countries_body.innerHTML = ''


    for (let i = 1; i <= 10; i++) {
        let row = `
            <tr>
                <td>${numberWithCommas(casesByCountries[i].Country)}</td>
                <td>${numberWithCommas(casesByCountries[i].TotalCases)}</td>
                <td>${numberWithCommas(casesByCountries[i].TotalRecovered)}</td>
                <td>${numberWithCommas(casesByCountries[i].TotalDeaths)}</td>
            </tr>
        `
        table_countries_body.innerHTML += row
    }

    //show ranking
    let rankIndex
    if (country=='World') showRanking(0)
    else
    {
        let rank = casesByCountries.find((e, index) => {
            rankIndex=index
            return e.Country == country
        })
        showRanking(rankIndex)
    }
    //show date
    showDate()

}

initAllTimesChart = async () => {
    let options = {
        chart: {
            height: '350',
            type: 'bar'
        },
        colors: [COLORS.serious_critical, COLORS.total_cases_per_1m, COLORS.new_cases],
        plotOptions: {
            bar: {
                columnWidth: '45%',
                distributed: true,
                dataLabels: {
                    position: 'top'
                  }
            }
        },
        dataLabels: {
            enabled:false
        },
        legend: {
            show: false
        },
        series: [],
        dataLabels: {
            enabled: true,
            dropShadow: {
                enabled: true,
                opacity: 1
            }
        },
        xaxis: {
            categories: [],
            labels: {
                style: {
                    colors: [COLORS.serious_critical, COLORS.total_cases_per_1m, COLORS.new_cases],
                    fontSize: '14px'
                }
            }
        },
    }

    all_time_chart = new ApexCharts(document.querySelector('#all-time-chart'), options)

    all_time_chart.render()
}

renderData = (world_data, status) => {
    let res = []
    switch (status) {
        case CASE_STATUS.serious_critical:
            res.push(world_data.Serious_Critical)
            break
        case CASE_STATUS.total_cases_per_1m:
            res.push(world_data.TotCases_1M_Pop)
            break
        case CASE_STATUS.total_deaths_per_1m:
            res.push(world_data.Deaths_1M_pop)
    }
    return res
}

loadAllTimeChart = async (country) => {

    let seriousCases_data, totalDeathsPer1m_data,totalCasesPer1m_data
    let country_data
    if (isGlobal(country)) {
        
        console.log('Serious case: ',seriousCases_data = Math.round(renderData(summary, CASE_STATUS.serious_critical)))
        console.log('Total cases per 1m population: ',totalCasesPer1m_data = Math.round(renderData(summary, CASE_STATUS.total_cases_per_1m)))
        console.log('Total deaths per 1m population: ',totalDeathsPer1m_data = Math.round(renderData(summary, CASE_STATUS.total_deaths_per_1m)))

    } else {
        country_data = summaryData.find(function(e){
                return e['Country']===country
        })

        console.log('Serious case: ',seriousCases_data = Math.round(renderData(country_data, CASE_STATUS.serious_critical)))
        console.log('Total cases per 1m population: ',totalCasesPer1m_data = Math.round(renderData(country_data, CASE_STATUS.total_cases_per_1m)))
        console.log('Total deaths per 1m population: ',totalDeathsPer1m_data = Math.round(renderData(country_data, CASE_STATUS.total_deaths_per_1m)))

    }

    let series = [{
        name: 'Cases',
        data: [{
            x: 'Serious Cases', 
            y: seriousCases_data
        }, {
            x: 'Total cases per 1m population',
            y: totalCasesPer1m_data
        }, {
            x: 'Total deaths per 1m population',
            y: totalDeathsPer1m_data}]
        }]

    all_time_chart.updateOptions({
        series: series,
        xaxis: {
            categories: ['Serious Cases', 'Total cases per 1m population', 'Total deaths per 1m population']
        }
    })
}

initRecoveryRate = async () => {
    let options = {
        chart: {
            type: 'radialBar',
            height: '350'
        },
        series: [],
        labels: ['Recovery rate'],
        colors: [COLORS.recovered]

    }

    recover_rate_chart = new ApexCharts(document.querySelector('#recover-rate-chart'), options)

    recover_rate_chart.render()
}

loadRecoveryRate = async (rate) => {
    // Use updateSeries
    recover_rate_chart.updateSeries([rate])
}

// darkmode switch

initTheme = () => {
    let dark_mode_switch = document.querySelector('#darkmode-switch')

    dark_mode_switch.onclick = () => {
        dark_mode_switch.classList.toggle('dark')
        body.classList.toggle('dark')

        setDarkChart(body.classList.contains('dark'))
    }
}

setDarkChart = (dark) => {
    let theme = {
        theme: {
            mode: dark ? 'dark' : 'light'
        }
    }
    all_time_chart.updateOptions(theme)
    days_chart.updateOptions(theme)
    recover_rate_chart.updateOptions(theme)
}

// country select
renderCountrySelectList = (list) => {
    let country_select_list = document.querySelector('#country-select-list')
    country_select_list.querySelectorAll('div').forEach(e => e.remove())
    
    list.forEach(e => {
        let item = document.createElement('div')
        item.classList.add('country-item')
        item.textContent = e.toString()

        item.onclick = async () => {
            document.querySelector('#country-select span').textContent = e.toString()
            country_select_list.classList.toggle('active')
            await loadData(e.toString())
        }
        
        country_select_list.appendChild(item)
    })
}

loadCountrySelectList = async () => {
    let country_select_list = document.querySelector('#country-select-list')

    let item = document.createElement('div')
    item.classList.add('country-item')
    item.textContent = 'World'
    item.onclick = async () => {
        document.querySelector('#country-select span').textContent = 'World'
        country_select_list.classList.toggle('active')
        await loadData('World')
    }
    country_select_list.appendChild(item)

    renderCountrySelectList(countries_list)
}

// Country filter
initCountryFilter = () => {
    let input = document.querySelector('#country-select-list input')
    input.onkeyup = () => {
        let filtered = countries_list.filter(e => e.toLowerCase().includes(input.value.toLowerCase()))
        renderCountrySelectList(filtered)
    }
}