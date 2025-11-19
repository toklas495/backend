import http from 'http';
import RequestHandler from './handler/request.handler.mjs';
import setVariableHandler from './handler/setVariable.handler.mjs';

const builder   = {
    async requestHandler(argv){
        await RequestHandler(http,argv)
    },
    async setVariableHandler(argv){
        await setVariableHandler(argv);
    }
}

export default builder;
