class Request{
    constructor(httpModule){
        //http request
        this.http = httpModule;
        this.options = {};
        this.payload = null;
    }
    addHost(host){
        this.options.host = host;
        return this;
    }

    addPort(port){
        this.options.port = port;
        return this;
    }

    addMethod(method="GET"){
        this.options.method=method.toUpperCase();
        return this;
    }

    addPath(path="/"){
        this.options.path=path;
        return this;
    }

    addHeaders(headers={}){
        this.options["headers"] = headers;
        return this;
    }

    addBody(body={}){
        this.payload = JSON.stringify(body);

        this.options.headers = this.options.headers||{};
        this.options.headers["Content-Type"] = "application/json";
        this.options.headers["Content-Length"] = Buffer.byteLength(this.payload);
        return this;
    }

    async send(){
        return new Promise((resolve,reject)=>{
            const req = this.http.request(this.options,(res)=>{
                let data = [];
                res.on('data',(chunk)=>{
                    data.push(chunk);
                })

                res.on("end",()=>{
                    const body = Buffer.concat(data).toString();

                    //try to parse json automatically
                    try{
                        resolve({
                            status:res.statusCode,
                            headers:res.headers,
                            json:JSON.parse(body)
                        })
                    }catch{
                        resolve({
                            status:res.statusCode,
                            headers:res.headers,
                            body:body
                        })
                    }
                });
            })
            req.on("error",resolve);
            if(this.payload) req.write(this.payload);

            req.end()
        })
    }

}


export default Request;