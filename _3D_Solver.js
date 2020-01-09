const line = function (message) {
    let row =  $("<tr>");
    let s = $("<td>");
    s.append("&gt;&gt;");
    let m = $("<td>");
    m.attr("style","width: 100%; " +
        "text-align: left;");
    m.append(message);
    row.append(s);
    row.append(m);
    current_line2 = row.clone();
    return row;
};
const heap_cell = function (index, value) {
  let cell = $("<tr>"), i = $("<td>");
    i.append(index); //We show the index.
  let v = $("<td>");
  v.attr("id","H"+index);
  v.append(value); //We set the value
  cell.append(i);
  cell.append(v);
  return cell;
};
const stack_cell = function (index, value) {
    let cell = $("<tr>"), i = $("<td>");
    i.append(index); //We show the index.
    let v = $("<td>");
    v.attr("id","S"+index);
    v.append(value); //We set the value
    cell.append(i);
    cell.append(v);
    return cell;
};
const temporal_cell = function (name, value) {
    let cell = $("<tr>");
    let i = $("<td>");
    i.append(name); //We show the name of the temporal.
    let v = $("<td>");
    v.attr("id","T_"+name);
    v.append(value); //We set the value
    cell.append(i);
    cell.append(v);
    return cell;
};

function show_new_segment($container, size,prefix) {
    let max_rows = size/2;
    $container.empty();
    let i = 0;
    while(i<max_rows){
        let $row = $("<tr>");
        let $index = $("<td>");
        $index.html(i);
        let $val = $("<td>");
        $val.attr("id",prefix+i);
        $val.html(0);
        let $index2 = $("<td>");
        $index2.html(i+max_rows);
        let $val2 = $("<td>");
        $val2.attr("id",prefix+(i+max_rows));
        $val2.html(0);
        $row.append($index);
        $row.append($val);
        $row.append($index2);
        $row.append($val2);
        $container.append($row);
        i++;
    }
}

function update_heap(index,value) { //A function to update the heap Graphically.
    let signature = "#H"+index; //We build the ID of the exact cell we'll edit.
    if(index>=MAX_HEAP_DISPLAY){
        if(CAP_HEAP_DISPLAY){
            if(!alerted_H){
                alert("To keep optimal performance in debugger, visualization of any Heap index past "+MAX_HEAP_DISPLAY+" is forbidden.");
            } alerted_H = true;
            return;
        }else{ //Alright we haven't capped the display limit this means we could make a new segment twice as big.
            MAX_HEAP_DISPLAY = MAX_HEAP_DISPLAY*2; //We increase it.
            show_new_segment($("#Heap_Display"),MAX_HEAP_DISPLAY,"H");
        }
    }
    let h = $(signature); //We get the cell
    h.html(value); //We update the value.
}
let alerted_H = false;
let alerted_S = false;
function update_stack(index,value) { //A function to update the heap Graphically.
    let signature = "#S"+index; //We build the ID of the exact cell we'll edit.
    if(index>=MAX_STACK_DISPLAY){
        if(CAP_STACK_DISPLAY){
            if(!alerted_S){
                alert("To keep optimal performance in debugger, visualization of any Stack index past "+MAX_STACK_DISPLAY+" is forbidden.");
            } alerted_S = true;
            return;
        }else{ //Alright we haven't capped the display limit this means we could make a new segment twice as big.
            MAX_STACK_DISPLAY = MAX_STACK_DISPLAY*2; //We increase it.
            show_new_segment($("#Stack_Display"),MAX_STACK_DISPLAY,"S");
        }
    }
    let h = $(signature); //We get the cell
    h.html(value); //We update the value.
}
function update_temporal(name,value) {
    let signature = "#T_"+name;
    if(!$(signature).length){ //Doesn't exist, let's add it.
        $("#Temporals_Display").append(new temporal_cell(name, 0));
    }
    let t = $(signature);
    t.html(value);
}
//region begin_3D
function begin_3D(){
    play_3D(true);
}
function begin_execution(){
    if(!$("#Recover_Container").hasClass('Debug_Container_Hide'))$("#Recover_Container").addClass('Debug_Container_Hide'); //We hide the continue option if visible.
    play_3D(false);
}
//endregion
//region next_3D
function next_3D(){
    if(!compiling)if(new_3D_cycle())return;
    let instruction = instructions[IP]; //We get the next instruction to execute.
    play_instruction(instruction,true); //We play the instruction and show what happened.
}
//endregion
//region jump_3D
function jump_3D(){ //Same as next, except we skip proc calls.
    if(!compiling)if(new_3D_cycle())return;
    let instruction = instructions[IP]; //We get the next instruction to execute.
    if($("#Current_Instruction").text().includes("call")){
        let og_length = INSTRUCTION_STACK.length-1; //I just performed the jump one instruction ago.
        while (play_instruction(instruction,true)&&(og_length!=INSTRUCTION_STACK.length)){
            instruction = instructions[IP];
        }
    }else play_instruction(instruction,true);
}
//endregion
//region next_BP
function next_BP(){
    if(!compiling)if(new_3D_cycle())return;
    let instruction;
    do{
        instruction =  instructions[IP];
    }while (play_instruction(instruction,true)&&!breakpoints.includes(parseInt(IP)));
}
//endregion
//region continue_3D
function continue_3D(){ //Resumes execution and no longer stops until execution is finished.
    if(!compiling)if(new_3D_cycle())return;
    let instruction;
    do {
        instruction = instructions[IP];
    }while (play_instruction(instruction,true));
}
//endregion
//region recover_execution
function recover_execution(){ //Resumes execution and no longer stops until execution is finished.
    //if(!compiling)if(new_3D_cycle())return; NO need to start a new cycle as this option is only shown when there's a current cycle going on.
    let instruction;
    do {
        instruction = instructions[IP];
    }while (play_instruction(instruction,false));
}
//endregion
//region stop_3D
function stop_3D(){ //Resets execution.
    compiling = false;
    new _3D_Exception(null,"Stopped 3D execution.",false);
}
//endregion
/////////////////////////////////////////////////////////////////////IMPORTANT/////////////////////////////////////////////
function play_instruction(instruction,debug = false) {
    IC++;
    if(IC>=INSTRUCTION_MAX&&CAP_INSTRUCTION_EXECUTION){
        new _3D_Exception(null,"Potential infinite loop prevented. Cannot execute more than "+INSTRUCTION_MAX+" Sentences. <break>",false);
        current_line = new line("");
        append_to_3D_console();
        IC = 0;
        $("#Recover_Container").removeClass('Debug_Container_Hide');
        return false;
    }
    if(debug){
        $("#Current_Instruction").html(IP+") "+instruction.signature); //We update the instruction we're executing.
    }
    let destiny = null;
    let address = 0;
    let vessel = 0;
    let value = 0;
    let a = 0;
    let b = 0;
    let c = 0;
    switch (instruction.name) {
        case "standard": //Standard 3D operation.
            a = instruction.a.text; //We get the name of temp we're using. or the value if we're having a number.
            a = Number(a); //We convert the text to a number (if applicable)
            if(isNaN(a)){ //Is a name not a number.
                a = temporals[instruction.a.text]; //We get the actual value.
            }
            if(instruction.a.negative){
                a = -1*a;
            }
            b = instruction.b.text; //We get the name of the temp we're using.
            b = Number(b);
            if(isNaN(b)){ //b is a name not a number
                b = temporals[instruction.b.text]; //We get the actual value
            }
            if(instruction.b.negative){
                b = -1*b;
            }
            switch (instruction.op) { //We perform the operation.
                case "+":
                    c = a+b;
                    break;
                case "-":
                    c = a-b;
                    break;
                case "*":
                    c = a*b;
                    break;
                case "/":
                    c = a/b;
                    break;
                case "%":
                    c = a%b;
                    break;
                default:
                    break;
            }
            if(instruction.c=='C'&&c<0)throw new _3D_Exception(instruction.a,'Cache underflow exception.',true); //We're attempting to put -1 to the cache.
            temporals[instruction.c] = c; //We set the value in the vessel.
            if(debug)update_temporal(instruction.c,c);
            increase_IP();//We update for next instruction.
            return true; //That's all!
        case "assignation":
            vessel = instruction.vessel;
            value = instruction.value.text;
            value = Number(value);
            if(isNaN(value)){
                value = temporals[instruction.value.text];
            }
            if(instruction.value.negative){
                value = -1*value;
            }
            temporals[vessel] = value;
            if(debug)update_temporal(vessel,value);
            increase_IP();//We update for next instruction.
            return true;
        case "GET_HEAP": //We're getting a value from the heap.
            address = instruction.address; //We get the name of the temporal
            address = temporals[address]; //We get the actual value.
            if(address<0) throw new _3D_Exception(null,"Heap underflow exception. (Should never happen)");
            vessel = instruction.vessel; //We get the name of the recipient temporal.
            temporals[vessel] = HEAP[address]; //We perform the assignation.
            if(debug)update_temporal(vessel,HEAP[address]);
            increase_IP();//We update for next instruction.
            return true; //That's all.
        case "SET_HEAP":
            if(HEAP.length>MAX_HEAP&&CAP_HEAP){
                new _3D_Exception(null,"Heap overflow exception. Max allowed: "+MAX_HEAP,false);
                MAX_HEAP = MAX_HEAP*1.5;
                return false;
            }
            address = instruction.address; //We get the name of the temporal
            address = temporals[address]; //We get the actual value.
            value = instruction.value.text; //Value or name
            value = Number(value); //If it is a number we get it.
            if(isNaN(value)){
                value = temporals[instruction.value.text]; //We get the actual value.
            }
            if(instruction.value.negative){
                value = -1*value;
            }
            HEAP[address] = value; //We perform the assignation.
            if(debug)update_heap(address,value);
            increase_IP();//We update for next instruction.
            return true;
        case "GET_STACK": //We're getting a value from the Stack.
            address = instruction.address; //We get the name of the temporal
            address = temporals[address]; //We get the actual value.
            if(address<0) throw new _3D_Exception(null,"Stack underflow exception.");
            vessel = instruction.vessel; //We get the name of the temporal vessel.
            temporals[vessel] = STACK[address]; //We perform the assignation.
            if(debug)update_temporal(vessel,STACK[address]);
            increase_IP();//We update for next instruction.
            return true; //That's all.
        case "SET_STACK": //We're setting a value in the Stack
            address = instruction.address; //We get the name of the temporal
            address = temporals[address]; //We get the actual value of the address.
            value = instruction.value.text; //Name or value.
            value = Number(value); //If it is a number we get it.
            if(isNaN(value)){ //Is a name not a number
                value = temporals[instruction.value.text]; //We get the actual value.
            }
            if(instruction.value.negative){
                value = -1*value;
            }
            STACK[address] = value; //We perform the assignation.
            if(debug)update_stack(address,value);
            increase_IP();//We update for next instruction.
            return true;
        case "goto":
            destiny = instruction.target; //Destiny is supposed to hold the name of the label we're targeting.
            destiny = labels[destiny]; //We replace the name of the label by the index of the instruction we're jumping to.
            if(destiny==undefined){
                new _3D_Exception(instruction.token,"Undefined label: "+instruction.target,true);
                compiling = false;
                return false;
            }
            set_IP(destiny); //We update the value of i so we can actually do the jump.
            return true; //We perform the jump.
        case "call": //How to perform jumps:
            INSTRUCTION_STACK.push({func:instruction.target,returnTo:find__Next(IP,instructions)}); //We push the instruction where we're supposed to return.
            CALLING_STACK.push(instruction.target); //we push the name of the call.
            destiny = instruction.target; //We get the name of the target.
            destiny = labels[destiny]; //We get the actual index of the instruction to execute.
            if(destiny==undefined){
                new _3D_Exception(instruction.token,"Undefined procedure: "+instruction.target,true);
                compiling = false;
                return false;
            }
            set_IP(destiny); //We update i.
            return true; //We perform the jump
        case "ret": //How to return back after a proc is finished:
            if(INSTRUCTION_STACK.length){
                destiny = getReturnAddress(instruction.target); //We get the address where we're supposed to return.
                set_IP(destiny); //We update i.
                return true; //We perform the jump back.
            }else{ //The stack is empty. This can only mean we finished the execution of 3D code.
                end_3d(true);
                compiling = false;
                return false;
            }
            break;
        case "if": //Conditional jump.
            a = instruction.a.text; //name or number
            b = instruction.b.text; //name or number
            a = Number(a);
            if(isNaN(a)){
                a = temporals[instruction.a.text];
            }
            b = Number(b);
            if(isNaN(b)){
                b = temporals[instruction.b.text];
            }
            if(instruction.b.negative){ //Is a negative version of the value
                b = -1*b;
            }
            if(instruction.a.negative){ //Is a negative version of the value.
                a = -1*a;
            }
            switch (instruction.op) {
                case "==":
                    c = a == b;
                    break;
                case "!=":
                    c = a!=b;
                    break;
                case ">":
                    c = a>b;
                    break;
                case "<":
                    c = a<b;
                    break;
                case "<=":
                    c = a<=b;
                    break;
                case ">=":
                    c = a>=b;
                    break;
                default:
                    break;
            }
            if(c){ //We perform the jump
                destiny = instruction.target; //We get the name of the target
                destiny = labels[destiny];  //We get the index of the target
                if(destiny==undefined){
                    new _3D_Exception(instruction.token,"Label not found: "+instruction.target,true);
                    compiling = false; //We start a new cycle because we cannot proceed without this label.
                    return false;
                }
                set_IP(destiny); //We update i.
            } else increase_IP();
            return true;
        case "print":
            a = instruction.format; //We get the format for how to print the argument.
            b = instruction.value.text; //We get the number/char to print
            b = Number(b); //We turn the number into a an actual number
            if(isNaN(b)){
                b = temporals[instruction.value.text]; //We get the value from the temporals
            }
            print(a,b); //We print the value
            increase_IP();//We go to next instruction.
            return true;
        case 'write':
            let content = pop_cache();
            let path = pop_cache();
            content = extract_String(content);
            path = extract_String(path);
            download(path,content);
            log('Cannot resume execution after writing & downloading a file. Exit code: 1');
            return false;
        case 'exit':
            switch (instruction.exitCode) {
                case '0': {
                    throw new _3D_Exception(instruction.token,'Null pointer exception.',true);
                    print_stack_trace();
                }
                case '1': {
                    let forLength = pop_cache();
                    let badIndex = Number(pop_cache()) - 1;
                    throw new _3D_Exception(instruction.token,'Array Index out of bounds. Index: '+badIndex+' out of bounds for length: '+forLength,true,true);
                }
                case '2': {
                    let instanceAttemptingToGetCasted = Number(pop_cache()); //just in case.
                    let castTarget = Number(pop_cache()); // just in case
                    if(castTarget==-1){
                        throw new _3D_Exception(instruction.token,'Cannot cast number :'+instanceAttemptingToGetCasted+" to CharCode.",true,true);
                    }
                    let a;
                    Object.values(Code_Generator.classes).forEach(c=>{
                       if(Number(c.id)==instanceAttemptingToGetCasted)a = c.name;
                    });
                    let b;
                    Object.values(Code_Generator.classes).forEach(c=>{
                        if(Number(c.id)==castTarget)b = c.name;
                    });
                    throw new _3D_Exception(instruction.token,'Cannot downcast class '+a+" to class "+b,true,true);
                }
                case '3':
                    let invalidString = pop_cache();
                    invalidString = extract_String(invalidString);
                    throw new _3D_Exception(instruction.token,'Error casting String to int. Invalid String:'+invalidString,true,true);
                default: throw new _3D_Exception(instruction.token,'FATAL ERROR at runtime. Finished execution with code: 4',true);
            }
        default:
            new _3D_Exception(instruction.token,"Unrecognized 3D instruction: "+instruction.signature,true);
            compiling = false;
            return false;
    }
    throw new _3D_Exception(null,"Instruction fell through: "+instruction.signature,false);
}
//endregion
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//region On document ready.
function initialize(){
    load_native_functions();
    $("#Iniciar_3D").click(begin_3D);
    $("#Siguiente_3D").click(next_3D);
    $("#Saltar_3D").click(jump_3D);
    $("#Siguiente_BP_3D").click(next_BP);
    $("#Continuar_3D").click(continue_3D);
    $("#Detener_3D").click(stop_3D);
    $("#Iniciar").click(begin_execution);
    $("#Recover").click(recover_execution);
    $("#clear_all_breakpoints").click(clear_all_breakpoints);
    $("#Debug_Console").empty();
    $("#Ejecutar_Console").empty();
    $("#Main_Console").empty();
    $("#Current_Instruction").empty();
    $("#ErrorTableBody").empty();
    $("#SYMBOL_TABLE_BODY").empty();
    $("#Classes_Body").empty();
    $("#Classes_Header").empty();
    $("#SYMBOL_TABLE_HEADER").empty();
    $("#OPTIMIZACION_BODY").empty();
    $("#OPTIMIZACION_HEADER").empty();
    current_line = null; //We set current_line back to null
    show_new_segment($("#Stack_Display"),MAX_STACK_DISPLAY,"S"); //We load default segment
    show_new_segment($("#Heap_Display"),MAX_HEAP_DISPLAY,"H"); //We load default segment
    $("#Temporals_Display").empty(); //We clear the temp list
    current_tab = $("#MAIN");
    $("#Depurar_Button").click(show_tab);
    $("#Compilar_Button").click(show_tab);
    $("#Ejecutar_Button").click(show_tab);
    $("#Errores_Button").click(show_tab);
    $("#TablaDeSimbolos_Button").click(show_tab);
    $("#AST_Button").click(show_tab);
    $("#Optimizacion_Button").click(show_tab);
    $("#Folders_Classes_Button").click(show_tab);
    $("#create_folder_button").click(addFolder);
    $("#create_file_button").click(create_file);
    $("#Guardar_Button").click(save_file);
    $("#Compilar_Main").click(compile_source);
    $("#Optimization_button").click(Optimize);
    $("#AST_Title").click(toggle_details);
    $("#Compile_Title").click(reset_compilation_cycle);
    document.getElementById('input-file')
        .addEventListener('change', getFile);
}
$( document ).ready(function() {
    initialize();
});

//endregion
