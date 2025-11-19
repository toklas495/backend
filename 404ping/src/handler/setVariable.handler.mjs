import {setVariable} from '../utils/fileHandle.mjs';

export default async function setVariableHandler(argv){
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
        console.error(error);
    }
}