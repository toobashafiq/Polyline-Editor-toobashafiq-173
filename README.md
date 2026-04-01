
Polyline Editor

Name: Tooba Shafiq
Seat No: B23110006173
Batch: BSCS-IIIB


Overview

Polyline Editor is an interactive application that allows users to create and manipulate polylines using mouse and keyboard. Users can add, move, delete, and insert points while receiving real-time visual feedback. The system maintains an internal model that stays consistent with the displayed drawing.


Features

Create new polyline (b)

Add points using mouse clicks

Move vertices (m) with drag support

Delete vertices (d) with automatic reconnection

Insert vertices on segments (i)

Undo / Redo actions (u, y, Ctrl+Z, Ctrl+Y)

Save and load drawings using JSON (s, l)

Refresh canvas (r)

Clear all polylines (q)



User Interaction

Mouse:

Click → add points

Drag → move points

Click near segment → insert point


Keyboard:

b → Begin new polyline

m → Move mode

d → Delete mode

i → Insert mode

r → Refresh

s → Save

l → Load

q → Quit/Clear

u / Ctrl+Z → Undo

y / Ctrl+Y → Redo



Data Structure

polys[] → Stores up to 100 polylines

Each polyline → Ordered list of vertices {x, y}

History stacks → Used for Undo/Redo operations



Conclusion

The Polyline Editor provides an efficient and user-friendly way to create and edit vector drawings. It supports real-time updates, history management, and persistent storage while maintaining consistency between the internal model and the visual output.

