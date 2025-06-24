# Sand Simulator

This project contains a simple falling-sand simulation implemented with `pygame`.
The simulation models sand particles that fall under gravity. You can place new
sand particles by clicking the left mouse button.

## Requirements

- Python 3.8 or newer
- `pygame` (listed in `requirements.txt`)

Install dependencies with:

```bash
pip install -r requirements.txt
```

## Running the simulation

Execute the following command:

```bash
python sand_sim.py
```

A window will open showing a grid. Left-click on cells to drop sand. The sand
falls according to simple rules: it moves down if the space below is empty,
otherwise it will try to slide diagonally.

Press the window's close button to exit.
