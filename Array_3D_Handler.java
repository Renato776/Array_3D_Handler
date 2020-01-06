public class Array_3D_Handler{

	public void compile_array(){
        /*
         * This method takes a lot of input. For this method to work the Cache must look like:
         *
         * Dimension
         * Size_N
         * ...
         * ...
         * ...
         *  Size_1
         *  Size_0
         *
         * Where  Size_0 makes reference to the size for the most
         * outer array (the array with the highest dimension) And Size_N makes reference to the size for
         * the most inner array (the array with only 1 dimension)
         *
         * It takes all of this arguments and returns a single ArrayAddress.
         * */
        double ag;
        double r1,r2;
        //1) //Initialize aux segment:
        AUX = new Stack<>();
        //2) pop the dimension:
        double r =  cache.pop(); //r = dim
        //3) push initial array to copy:
        AUX.push((double) 0);
        while(r>0){
            r--;
            ag = AUX.pop();
            AUX.push(r);
            AUX.push(ag);
            //Swap & push Dim to aux. At this point the prev array must be at the top of aux. And Index_N at the top of Cache.
            basic_array_allocation();
            r = cache.pop(); //R = newArrayAddress.
            ag = HEAP[(int)r];//AG = newArraySize.
            cache.push(r);
            r = ag; //R = new_array_size
            while(r>0){
                r--; //We decrease the size of the array.
                r1 = AUX.pop();
                AUX.push(r);
                AUX.push(r1);
                r = AUX.pop(); //R = Address of the previous array.
                cache.push(r); //We push it to the cache
                copy_array(); ////We copy the previous array. Also the copy doesn't remove the Address from the cache.
                r = cache.pop(); //R = Copy address.
                r1 = AUX.peek();
                r1++; //We increase it by 1.
                r2 = cache.pop();//R2 = prevArrayAddress
                AUX.push(r2); //We push it to the aux stack
                r2 = cache.peek(); //R2 = newArrayAddress
                r2 = r2 + r1; //R2 = cell address within array.
                HEAP[(int)r2] = r; //We put the copy in the array.
                //11) We swap the top positions in aux.
                r = AUX.pop();
                r1 = AUX.pop();
                AUX.push(r);
                AUX.push(r1);
                //12) We get the size of the array back:
                r = AUX.pop();
            }
            //15) Alright, at this point the array has been fully initialized. So next step is going to the next dimension:
            AUX.pop(); //discard
            r = cache.pop();//R holds the initialized array.
            AUX.push(r); //We push R to the aux segment as we'll use it as prev array in next iteration.
            //16) We get dim counter from aux:
            r1 = AUX.pop();
            r = AUX.pop();
            AUX.push(r1);
            //17) Go to next iteration:
        }
        //19) Alright, at this point the resultant array is in the Aux segment. We just gotta take it from there and push it to the cache.
        r = AUX.pop();
        cache.push(r);
        //Alright, that's all!!
    }
    public void transfer_array(){
        /*
        * This method takes as argument 2 arrays and transferes the values from the first one to the second one.
        * This method assumes the recipent's size is greater than or equal than the array we're transfering the values from.
        * The cache is expected to be filled like:
        * Array_to_transfer_values_from (Address)
        * OG_Vessel(address)
        * */
        int other_array = (int)cache.pop();
        int vessel = (int)cache.pop();
        int size = (int)HEAP[other_array];
        int i = 1;
        while(i<=size){
            HEAP[vessel+i] = HEAP[other_array+i]; //We perform the copy
            i++;
        }
        cache.push(vessel); //We push the OG's address back.
    }
    public void linear_copy(){
        /*
        * Performs a linear copy and returns the copy.
        * The difference with copy_array is that copy_array makes a recursive copy of the parameter.
        * This one performs only a  linear copy of it.
        * */
        int og_address = (int)cache.pop();
        int size = (int)HEAP[og_address]; //We get the size of the target we're copying.
        int new_address = malloc(size+1); //We allocate the same space for the new one.
        HEAP[new_address] = size; //We set the size of the new one.
        int i = 1;
        while(i<=size){
            HEAP[new_address+i] = HEAP[og_address+i]; //We transfer the values.
            i++;
        }
        cache.push(new_address); //We push the copy.
    }
    private void copy_array() {
        /*
         * This method takes an ArrayAddress as parameter, pushes it back immediately and then proceeds to copy it.
         * If the address this method receives is 0 it returns 0.
         * After allocating space for a new Array with same size as OG, it will then read each cell in OG
         * and if the cell != 0 it'll copy the cell & put the result in copy[cell].
         * This implies copy_array is a powerful recursive method which could iterate trough infinity if
         * a proper ending array is missing (the ending array should be one with all its cells initialized to 0)
         * */
        double r,r1,r2,new_cell_offset;
        double i1,i2;
        //1) Get the OG's address and push it back:
        r = cache.peek();
        if(r==0){
            cache.push(0.0);
            return; //We're attempting to copy a null array. There's nothing to do.
        }
        r = HEAP[(int)r]; //R = Heap[R] = size
        cache.push(r); //We push the size to allocate the new array.
        basic_array_allocation();
        r = cache.peek(); //R holds the new Array Address.
        r = HEAP[(int)r]; //r = size from new Array
        while(r>0){
            new_cell_offset = r;
            r = r -1 ;
            cache.push(r);
            r = cache.pop();
            r1 = cache.pop();
            r2 = cache.pop();
            cache.push(r);
            cache.push(r1);
            cache.push(r2);
            r = cache.peek();
            i1 = new_cell_offset + r;
            i1 = HEAP[(int)i1]; //I1 = OG's cell value
            if(i1 == 0){ //The OG array is filled with 0s there fore there's nothing else to copy.
                //However, before we return we must put the cache in proper order:
                r = cache.pop(); //R = OG
                r1 = cache.pop(); //R1 = new array
                r2 = cache.pop(); //R2 = Size -1. (discard)
                cache.push(r);
                cache.push(r1);
                //Alright you can leave now.
                break;
            }
            cache.push(new_cell_offset); //new_cell_offset
            cache.push(i1); //cell's value
            copy_array();
            r = cache.pop(); //copy
            r1 = cache.pop(); // cell's value'
            new_cell_offset = cache.pop(); // (cell's offset)
            r2 = cache.pop(); //OG array
            i1 = cache.pop(); //new Array
            r1= cache.pop(); //Size -1
            i2 = i1 + new_cell_offset; //i2 = new array cell address.
            HEAP[(int)i2] = r; //We set the copy in the newArray's cell address.
            cache.push(r2); //OG
            cache.push(i1); //NewArray
            cache.push(r1); //Size -1
            r = cache.pop(); //r = size -1.
            //go to next iteration
        }
        //That's all!!
    }

    private void basic_array_allocation() {
        /*
         * This method takes the size of the array as parameter from the cache & pushes back
         * the address of a new array based in the provided size.
         * */
        //atm the size of the array is at the top.
        double R;
        R = cache.peek(); //R holds the size of the array.
        R = R + 1; //However the true size R +1 (To make space for the size)
        int address = malloc((int)R); //We allocate space in memory for the array.
        //Alright now we got the address we'll use for this array.
        //The next thing we must do is setting the array's size.
        R = cache.pop(); //We get the OG size of the array (before the increment)
        HEAP[address] = R; //We set the size of the array.
        cache.push(address); //We push the new Array Address to the cache.
    }
    
    public int malloc(int size){
        if(H+size >= MAX_HEAP){
            Printing.log("FATAL ERROR: Heap Overflow exception.");
            Printing.log("Max Heap size allowed: "+MAX_HEAP);
            Printing.log("Heap will be reset. Unexpected behavior might happen.");
            reset_heap();
            H = RESERVED_HEAP_CEILING+1;
        }
        int res = H;
        increase_h(size);
        return res;
    }
}
