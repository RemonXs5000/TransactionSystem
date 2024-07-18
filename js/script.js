// Global Variables
const SearchBar =document.querySelector("#searchBar")
const SearchName =document.querySelector("#SearchName")
const SearchAmount =document.querySelector("#SearchAmount")
const TableContent = document.querySelector(".table-content")
const ctx = document.getElementById('chart');
let chart; 
let joinedData ;


// EventListeners
SearchName.addEventListener("click",()=>{
    FilterbyName(SearchBar.value)
})

SearchAmount.addEventListener("click",()=>{
    FilterbyAmount(SearchBar.value)
})


getTransactionData();

// Functions
async function getTransactionData(){
    // fetching  Transaction & Customers Data 
    let transactionResponse = await fetch('http://localhost:3000/transactions');
    let transactiondata = await transactionResponse.json();
    let customersResponse = await fetch('http://localhost:3000/customers');
    let customerdata = await customersResponse.json();
     // Joining Transaction & Customers Data 
    joinedData = CompineData(customerdata,transactiondata); 
    DisplayTransactionData(joinedData);
}


function CompineData(customerData,TransactionData){
    // function that combine both Customer/transaction Data using the Customer ID 
  const joinedData = TransactionData.map(transaction => {
    const customerTransactions = customerData.filter(customer => customer.id == transaction.customer_id);
    return { ...transaction,customer: customerTransactions };
    });
    return joinedData
}

function DisplayTransactionData(arr){
    // function that display data In the Table 
    let html = ``
    arr.forEach(element => {
        let {id , date , amount} = element
        let customerName = element.customer[0].name; 
        html += `<tr>
                    <td>${id}</td>
                    <td>${customerName}</td>
                    <td>${date}</td>
                    <td>${amount}</td>
                </tr>
                `

    })
    TableContent.innerHTML = html ;
}



async function FilterbyName(term){
    // Function Uses the Name in searchBar to search in the Transaction table 
    if(term == ""){
        getTransactionData();
    }else{
        const FilterData =[]; 
        let customersResponse = await fetch(`http://localhost:3000/customers?name=${term}`);
        let customerdata = await customersResponse.json();
        let {name} = customerdata[0];
        joinedData.forEach(transaction=>{
            if(name == transaction.customer[0].name){
                FilterData.push(transaction)
            }
    })
    DisplayTransactionData(FilterData);
    DisplayGraph(FilterData);
}
}



async function FilterbyAmount(term){
     // Function Uses the amount in searchBar to search in the Transaction table 
    if(term == ""){
        getTransactionData();
    }else{
        const FilterData =[]; 
        let customersResponse = await fetch(`http://localhost:3000/transaction?amount=${term}`);
        joinedData.forEach(transaction=>{
          if(term == transaction.amount){
            FilterData.push(transaction)
          }
        })
        DisplayTransactionData(FilterData);
        DisplayGraph(FilterData);
    }  
}




function DisplayGraph(data){
    // Function that Display A Bar Chart for the Selected Customer
    const dates =[];
    const amounts = [];
    data.forEach(data=>{
        dates.push(data.date)
        amounts.push(data.amount)
    })
    // distroy the Current Chart inorder to Draw Another one 
    if(chart){
        chart.destroy();
    }
    chart =  new Chart(ctx, {
        type: 'bar',
        data: {
          labels: dates,
          datasets: [{
            label: '# of Votes',
            data: amounts,
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
}