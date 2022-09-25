async function generateLink(){
    //alert("hello");
    
    //document.getElementById("linkText").innerHTML = "Hello World" ;

    let url = '/getLink';
    fetch(url)
    .then(response => response.json())  
    .then(json => {
        console.log(json);
        link = json.url;
        document.getElementById("linkText").href = link;
        document.getElementById("linkText").innerHTML = "127.0.0.1/"+link;
    })

}