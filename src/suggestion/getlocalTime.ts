export class localTime {
   
    private getlocalTime() {
        var d = new Date()
        var offset = (new Date().getTimezoneOffset() / 60) * -1
        var n = new Date(d.getTime() + offset)
        var formatted_date = n.getDate() + '-' +
                            (n.getMonth() + 1) +
                            '-' + n.getFullYear() + ' ' +
                            n.getHours() + ':' + 
                            n.getMinutes() + ':' +
                            n.getSeconds()
        return formatted_date 
    }
    
}