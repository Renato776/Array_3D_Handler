# Array_3D_Handler
A simple Java class with all needed 3D array handling methods.
<br>
<h1>Assumptions</h1>
<p>
For this methods to work, there are some assumptions that must be true:
<ul>
<li>
Cache is the name given to the 3D stack in this class.
</li>
<li>
Heap is the name of the 3D heap.
</li>
<li>
Aux is an axuliary segment similiar in properties as Stack & Heap but completely independent. This was possible
here because it was interpretated, however if you're making a traditional 3D code generator, I'm not sure how
you'd implement the Auxiliar segment without using any extra segments.
</li>
<li>
All block variables declared as double are temporals. Since this code was being interpretated temporals are
represented as double variables holding the values held within the Stack/Heap. In a traditional 3D code generator you'd only
need to use temporals with the same name as these.
</li>
<li>
Here, Stack and Heap are represented as Java arrays of doubles. The definition for them would be:
double[] STACK = new double[MAX_STACK];</br>
double[] HEAP = new double[MAX_HEAP];</br>
</li>
</ul>
</p>
