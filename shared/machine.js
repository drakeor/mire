 /* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    exports = module.exports = StateMachine;

    /**
     * Constructs a State Machine
     *
     * The transition list is for state transitions that do not conform to the default
     * transition: current_state x alphabet -> current_state (null callback).
     *
     * Remember that if you supply an EPSILON transition on a state, it must be the
     * only transition on a given state. Also remember that you cannot specify
     * more than one EPSILON transition (this is a Deterministic Finite Automaton
     * w/ epsilon transitions.)
     *
     * FYI: Epsilon transitions are transitions that automatically go from the given
     * state to a next state. For example with the given transition:
     * Transition<> (s0, EPSILON, nullptr, s1)
     * If your machine transitions to s0 then it will immediately transition to s1.
     * Note that if the callback as not NULL, it would also call the callback.
     * Further note that epsilon transition callback returns are ignored.
     *
     * @return new FiniteStateMachine.
     */
    function StateMachine() {
        this.transitionMap = {};
        this.currentState = "";

        // Statics related to state change
        this._tList = {};
        this._eventStack = [];
        this._deepTransition = false;
        this._stateToTransition = "";
    };

    // Predefined Events
    StateMachine.Event = {
        "EPSILON": "epsilon"
    };

    /**
     * Adds a transition to the machine.
     *
     * @param state Current State
     * @param nextState The final state after transition
     * @param event Event to trigger the transition
     * @return Whether the state was added
     */
    StateMachine.prototype.addTransition = function(state, nextState, event) {
        // Check the FSM for sanity.
        if (!this.isOk(state, nextState, event)) {
            console.log("Error: Added state would make FSM unstable.");
            return;
        }

        // Check if the key exists in the map.
        if (this.transitionMap[state] === undefined) {
            this.transitionMap[state] = {};
        }

        // Add the new event
        this.transitionMap[state][event] = {
            "callbacks": [],
            "next": nextState
        };

        // The first state added will be the initial state.
        if (this.currentState == "") {
            this.currentState = state;
        }
    };

    /**
     * Adds an epsilon transition to the machine.
     * This means that the machine will automatically transition to the next state.
     * After calling the callbacks. Note that it must be the only transition on a given state.
     *
     * @param state Current State
     * @param nextState The final state after transition
     * @return Whether the state was added
     */
    StateMachine.prototype.addEpsilonTransition = function(state, nextState) {
        if (this.currentState == "") {
            // The first state cannot be an epsilon transition.
            console.log("ERROR: Please specify a static transition for your first state. Suggestion: Init Machine?");
            return false;
        }

        return this.addTransition(state, nextState, StateMachine.Event.EPSILON);
    };

    /**
     * Adds a callback to a specific transition on the machine.
     * This function will be called before the transition is done.
     *
     * @param state Current State
     * @param event The event in question
     * @param callback function to call
     * @param priority An optional parameter which specifies a priority. Higher numbers called first.
     */
    StateMachine.prototype.addTransitionCallback = function(state, event, callback, priority) {
        var priority = priority || 0;
        var transitions = this.getTransitionsPerState(state);

        if (transitions === undefined || transitions[event] === undefined) {
            console.log("Error: The transition has to exist.");
            return false;
        }

        transitions[event].callbacks.push({
            "func": callback,
            "priority": priority
        });

        // Sort the callbacks.
        transitions[event].callbacks.sort(function(a, b) {
            if (a.priority > b.priority) {
                return -1; // Sort a to a lower index.
            }
            if (a.priority < b.priority) {
                return 1; // Sort a to a higher index
            }
            return 0;
        });
    };

    /**
     * Checks if the next transition can be safely added to the transition list.
     * If it cannot be added safely, then it will return false. Otherwise,
     * there is no problem with the insertion.
     *
     * This will return false when:
     *  o If tToAdd is an epsilon transition while the state already exists in the map.
     *  o If tToAdd is a transition that is attempting to be placed along side an
     *    epsilon transition.
     *  o If there is an existing event on that state. Each event must be discrete.
     *
     * Otherwise it will return true.
     *
     * @param state Current State
     * @param nextState The state to transition to
     * @param event Event to trigger the transition
     * @return whether the insertion is sane.
     */
    StateMachine.prototype.isOk = function(state, nextState, event) {
        if (state == "" || nextState == "") {
            console.log("Note: States must have names.");
            return false;
        }

        // If this is a new state, it's fine.
        if (this.transitionMap[state] === undefined) {
            return true;
        }

        if (event == StateMachine.Event.EPSILON) {
            // This is an epsilon event
            // If this returns true, this will be the only event on that state.
            return (Object.keys(this.transitionMap[state]).length == 0)
        } else {
            // This isn't an epsilon event.
            // Let's make sure this event is discrete.
            for (var existingEvent in this.transitionMap[state]) {
                if (event == existingEvent) {
                    // Each event must be discrete. This is a violation of #3.
                    return false;
                }
            }

            // We're okay. It will be fine to add this.
            return true;
        }
    };

    /**
     * Returns a list of transitions attached to a given state.
     *
     * @return list of transitions from given state
     */
    StateMachine.prototype.getTransitionsPerState = function(state) {
        return this.transitionMap[state];
    };

    /**
     * Returns the current state.
     *
     * @return current state
     */
    StateMachine.prototype.getCurrentState = function() {
        return this.currentState;
    };

    /**
     * Pushes an Event onto the State Machine.
     *
     * If this function is called with an empty Pending Events Stack, then it will
     * push the event onto the pending events stack and then immediately start the
     * transition. If at any time during a transition, another call to PushEvent is
     * called, then it will only add to the pending events stack. Once the primary
     * call returns from the transition callback, it will check to see if the stack
     * size is 1 (itself). If it is, it will empty the stack and return. Otherwise,
     * it will pop the top of the stack and continues to process the pending events
     * until only one transition is left on the stack. It then empties the stack and
     * returns true.
     *
     * Note that if you call a transition event inside a callback you cannot expect
     * a return from either your callback or the newly pushed event's callback to
     * prevent transition of the machine. In your callback, if you intend to return
     * false you must not push another event onto the machine (as it will not be
     * reversed.)
     *
     * If you do not push transition events inside your callback and you do return
     * false the machine will not transition and this function will also return
     * false if either of these are not the case this function will return true and
     * will transition to the next state(s).
     *
     * @param events Event to push onto the machine.
     * @param args Argument to push.
     * @return Whether the event was successful.
     */
    StateMachine.prototype.pushEvent = function(event, args) {
        var goodTransition = true;
        var found = false;
        var tFound = {};

        if (this._eventStack.length == 0) {
            // Set the statics
            this._stateToTransition = this.currentState;
            this._tList = this.getTransitionsPerState(this._stateToTransition);
            this._deepTransition = false;

            // Push the event onto the event stack
            this._eventStack.push(event);

            if (this._tList === undefined || this._tList[event] === undefined) {
                // This is the default transition
                // We just transition to ourselves without a callback.
                this._eventStack.pop();
                return true;
            } else {
                // We're doing a transition!
                var callbacks = this._tList[event].callbacks;

                this._stateToTransition = this._tList[event].next;
                this._tList = this.getTransitionsPerState(this._stateToTransition);

                // This is the transition we need.
                for (var callback in callbacks) {
                    // Call the callback. If any callback returns false it is unsuccessful.
                    goodTransition &= callbacks[callback].func(args);
                }
            }

            if (this._deepTransition || goodTransition) {
                // Either we had a deep transition (epsilon, etc)
                // Or the transition was good.

                // We need to check if this new state has an epsilon transition
                // If it is, we will call ourselves.
                if (this._tList !== undefined && Object.keys(this._tList).length == 1 && Object.keys(this._tList)[0] == StateMachine.Event.EPSILON) {
                    // This is an epsilon transition.
                    this.pushEvent(StateMachine.Event.EPSILON, args);
                }

                // We need to have just one event on the stack at this point.
                // Recursive calls will have settled by this point.
                if (this._eventStack.length != 1) {
                    console.log("ERROR: State Machine Event Stack Corruption!");
                    return false;
                }

                // Transition to the final decided state.
                this.currentState = this._stateToTransition;

                this._eventStack.pop();
                return true;
            } else {
                // We must've failed to transition.
                this._eventStack.pop();
                return false;
            }
        } else {
            // This is a recursive call to PushEvent
            // Push the new event onto the stack
            this._eventStack.push(event);
            this._deepTransition = true;

            if (this._tList === undefined || this._tList[event] === undefined) {
                // This is the default transition
                // We just transition to ourselves without a callback.
                this._eventStack.pop();
                return true; // Value ignored for recursive.
            } else {
                // We did find a transition.
                var callbacks = this._tList[event].callbacks;

                this._stateToTransition = this._tList[event].next;
                this._tList = this.getTransitionsPerState(this._stateToTransition);

                // This is the transition we need.
                for (var callback in callbacks) {
                    // Call the callback. If any callback returns false it is unsuccessful.
                    goodTransition &= callbacks[callback].func(args);
                }
            }

            // We need to check if this new state has an epsilon transition
            // If it is, we will call ourselves.
            if (this._tList !== undefined && Object.keys(this._tList).length == 1 && Object.keys(this._tList)[0] == StateMachine.Event.EPSILON) {
                // This is an epsilon transition.
                this.pushEvent(StateMachine.Event.EPSILON, args);
            }

            // On recursive calls to PushEvent, there is no need to set current.
            // Once these calls return, it will be set for us on the primary call.
            this._eventStack.pop();
            return true; // Values ignored on recursive call
        }
    };

});