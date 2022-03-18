const formatDate = (last_update) => {
    let a = new Date(last_update * 1000);
    
    let year = a.getFullYear();
    let month = a.getMonth();
    let date = a.getDate();
    
    let time = date + "/" + (month + 1) + "/" + year;

    return time;
};

const formatDateTime = (last_update) => {
    let a = new Date(last_update * 1000);
    
    let year = a.getFullYear();
    let month = a.getMonth();
    let date = a.getDate();

    let hour = a.getHours();
    let minute = a.getMinutes();
    
    let time = `${date}/${month+1}/${year} ${hour}:${minute}`;
    return time;
}

export { formatDate, formatDateTime }
