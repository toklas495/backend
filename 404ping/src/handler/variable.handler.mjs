import {setVariable,unSetVar} from '../utils/fileHandle.mjs';

export  async function setVariableHandler(argv){
    try{
        const {variables,global} = argv;
        const varObject = {};
        if(variables&&variables.length){
            variables.forEach(v=>{
                const [key,...value] = v.split(":").map(s=>s.trim());
                varObject[key] = value.join(":");
            })
            await setVariable(varObject);
        }
    }catch(error){
        throw error;
    }
}

export async function unSetVariableHandler(argv) {
    try{
        const {variables} = argv;
        if(variables&&variables.length){
            await unSetVar(variables);
        }
    }catch(error){
        throw error;
    }
}