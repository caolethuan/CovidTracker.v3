fetchRequest = async (url) => {
    const response = await fetch(url,
    {
        "method": "GET",
        "headers": 
        {
            "x-rapidapi-host": "vaccovid-coronavirus-vaccine-and-treatment-tracker.p.rapidapi.com",
            "x-rapidapi-key": "a3fe23876fmsh0c3a28ac6da6953p14090ajsn92434f27507e"
        }
    })
    return response.json()
}