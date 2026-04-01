NAME TOOBA SHAFIQ

SEAT NO:B23110006173

BATCH:BSCS-IIIB

Polyline Editor

Phase 1: Requirements

1. System Overview

The Polyline Editor is an application that allows users to create, edit, and manipulate drawings composed of multiple polylines using mouse and keyboard interactions.

The system supports direct manipulation, where:

•	Users add points to construct shapes.

•	Users move points through dragging.

•	Users delete points, with automatic reconnection of line segments.

•	Users can insert points inside existing polylines.

•	Users can undo or redo previous actions.

The interaction is continuous and incremental until the desired drawing is completed.

The system provides continuous visual feedback and maintains an internal model consistent with the display.

2. Functional Requirements

2.1 Begin Mode (‘b’) – Create New Polyline

•	User enters command mode via keyboard (b).

•	System creates a new polyline object and allocates it in polys[].

•	System enters construction state.

•	User can add points using mouse clicks.

2.2 Add Points – Mouse Click

•	Input: Mouse click event.

•	Processing: System captures (x, y) coordinates, creates a new vertex, and connects it to the previous point.

•	Output: Shape gradually forms as points are added.

2.3 Move Mode (‘m’) – Move a Point

•	User presses m.

•	System performs nearest-neighbor selection to detect closest vertex.

•	Selected vertex becomes draggable.

•	While dragging:

o	Coordinates update continuously.

o	Shape redraws in real time.

•	On release: old lines are erased, new lines are drawn, updating the polyline structure and history.

2.4 Delete Mode (‘d’) – Delete a Point

•	User presses d.

•	System identifies nearest vertex.

•	Selected vertex is removed, connected segments erased.

•	Remaining endpoints are reconnected, maintaining polyline topology.

•	Action is saved in history for undo.

2.5 Insert Mode (‘i’) – Insert a Point

•	User presses i.

•	System identifies nearest segment within a selection buffer.

•	New vertex is inserted on that segment, updating the polyline.

2.6 Undo / Redo

•	Undo: Reverts to previous polyline state (Ctrl+Z / u).

•	Redo: Re-applies next state (Ctrl+Y / Ctrl+Shift+Z / y).

•	History is maintained in a stack-based data structure.

2.7 Refresh (‘r’) – Screen Redraw

•	Clears rendering buffer and canvas.

•	Redraws all stored polylines from the internal model.

2.8 Save / Load

•	Save: Exports current polylines to a JSON file (s key).

•	Load: Loads previously saved JSON, replacing editor data (l key).

2.9 Quit / Clear (‘q’)

•	Clears all polylines from canvas after confirmation.

•	Optionally terminates the session.

2.10 Polyline Storage

•	Supports up to 100 polylines stored in polys[].

•	Each polyline is an ordered list of vertices {x, y}.

•	Internal model updates dynamically on add, move, delete, or insert.

3. User Interaction Requirements

•	Mouse: Add points, select nearest vertex, drag points, insert points.

•	Keyboard: Switch modes (b, m, d, i, r, q), Undo/Redo (u, y, Ctrl+Z/Ctrl+Y).

•	System must:

o	Accurately detect nearest vertex or segment.

o	Provide visual feedback for current mode and selected vertex.

o	Maintain internal model consistency.

4. Data Requirements

•	Data Structure:

polys[100] → collection of polyline objects

polyline → ordered list of vertices {x: float, y: float}

vertex → {x, y}

•	History stacks for Undo/Redo.

•	Each vertex stores coordinates {x, y}.

5. Input → Processing → Output

Action	Input	Processing	Output

Begin	b key	Create new polyline	New polyline started

Add Point	Mouse click	Add vertex + connect line	Shape grows

Move	Mouse drag	Find nearest vertex + update	Shape modified

Delete	Mouse click	Remove vertex + reconnect	Shape updated

Insert	Mouse click near segment	Insert vertex	Shape updated

Undo	Ctrl+Z / u	Revert history	Previous state restored

Redo	Ctrl+Y / y	Reapply history	Next state restored

Refresh	r key	Clear + redraw	Updated display

Save	s key	Export JSON	File saved

Load	l key	Load JSON	Canvas updated

Quit / Clear	q key	Clear all polylines	Canvas empty

6. Scenario 

1.	Press b → start new polyline → click points to draw house.

2.	Press m → select vertex → drag to adjust roof.

3.	Press d → delete incorrect vertex → system reconnects lines.

4.	Press i → click segment → insert vertex for finer control.

5.	Undo with u or Ctrl+Z → revert last insert.

6.	Redo with y or Ctrl+Y → reapply last insert.

7.	Save with s → export JSON file.

8.	Load with l → load saved shape.

9.	Refresh with r → redraw canvas.

10.	Quit/Clear with q → confirm to clear all polylines.

7. Conclusion

•	Focused on user-centered interaction and system behavior.

•	All functional and optional features are included.

•	Supports error recovery, history management, and persistent storage.

•	Internal data structure ensures efficient editing and visual consistency.



