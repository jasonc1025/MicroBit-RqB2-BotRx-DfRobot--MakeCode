/**
 * TODO
 * 
 * * Map joystick to account for exponential-curve distributed linearly
 * 
 * * Arm
 * 
 * * Jumper Wire for anti-drift control: Persistent
 */
/**
 * KeyLog
 * 
 * * 2019-0519-0340
 * 
 * DFRobot Driver Expansion Board
 * 
 * * 2019-0525-09-HAA TYJ first complete joystick XY
 * 
 * *
 * 
 * Create more responsiveness, no DeadZone
 */
/**
 * Micro-Servo 9G A0090 (Sparkfun)
 * 
 * ~ HiTec HS-55
 * 
 * MicroBit: 'servo set pulse pin Px (e.g. P8) to (us) ___'  :)+
 * 
 * 0 no
 * 
 * 250 0
 * 
 * 500 no
 * 
 * >> 750: 45
 * 
 * 1000 90 - 10 = 80
 * 
 * 1250 90 + 10 = 100
 * 
 * >> 1500 90 + 30
 * 
 * 1750 180 - 30
 * 
 * 2000 170
 * 
 * 2250 190
 * 
 * >> 2500 225 = 180 + 30/45
 * 
 * 2750 no
 * 
 * 3000 no
 * 
 * * Using DFRobot Servo Pins not reliable, possibly since these are 3.3.v servos (not standard 5.0v servos), thus use MicroBit 'servo write pin Pxx' blocks for reliable 0-180 degrees.
 */
input.onButtonPressed(Button.A, function () {
    _debug_On = !(_debug_On)
    if (_debug_On) {
        basic.showIcon(IconNames.Yes)
        basic.pause(2000)
    } else {
        basic.showIcon(IconNames.No)
        basic.pause(2000)
    }
})
function Motors_SpeedBoost_Straight_ViaJoystickY_Fn() {
    if (joystick_Y_Value > joystick_Midpoint + joystick_Deadzone) {
        motorRight_SpeedCore_ForStraight = Math.map(joystick_Y_Value, joystick_Midpoint + joystick_Deadzone, joystick_Value_MAX, 0, motor_GearSpeed_Current - motorRight_SpeedCore_SlowerForDriftControl)
        motorLeft_SpeedCore_ForStraight = Math.map(joystick_Y_Value, joystick_Midpoint + joystick_Deadzone, joystick_Value_MAX, 0, motor_GearSpeed_Current - motorLeft_SpeedCore_SlowerForDriftControl)
        joystick_Y_Value_ForLed_Base1 = Math.map(joystick_Y_Value, joystick_Midpoint + joystick_Deadzone, joystick_Value_MAX, 1, 5)
    } else if (joystick_Y_Value < joystick_Midpoint - joystick_Deadzone) {
        _codeComment_AsText = "To Go Reverse, Rather then Reverse/Switch 'Directional Rotation: CW/CCW', Reverse/Switch Polarity of 'motor_GearSpeed_Current' since motors can be controlled to go reverse by negative input values"
        motorRight_SpeedCore_ForStraight = Math.map(joystick_Y_Value, joystick_Midpoint - joystick_Deadzone, joystick_Value_MIN, 0, -1 * motor_GearSpeed_Current + motorRight_SpeedCore_SlowerForDriftControl)
        motorLeft_SpeedCore_ForStraight = Math.map(joystick_Y_Value, joystick_Midpoint - joystick_Deadzone, joystick_Value_MIN, 0, -1 * motor_GearSpeed_Current + motorLeft_SpeedCore_SlowerForDriftControl)
        joystick_Y_Value_ForLed_Base1 = Math.map(joystick_Y_Value, joystick_Midpoint - joystick_Deadzone, joystick_Value_MIN, -1, -5)
    } else {
        _codeComment_AsText = "DeadZone: Do Nothing"
        motorRight_SpeedCore_ForStraight = 0
        motorLeft_SpeedCore_ForStraight = 0
        joystick_Y_Value_ForLed_Base1 = 0
    }
}
// For BotRx-DfRobot
radio.onReceivedValueDeprecated(function (name, value) {
    if (_debug_On) {
        serial.writeString(" | " + name + " " + value + "     ".substr(0, 6 - ("" + value).length) + "|")
    }
    if (name == "x") {
        joystick_X_Value = value
    } else if (name == "y") {
        joystick_Y_Value = value
        Motors_SpeedBoost_Straight_ViaJoystickY_Fn()
        Motors_SpeedBrake_Turn_ViaJoystickX_Fn()
        Motors_Drive_Fn()
    } else if (name == "be") {
        button_E_Value = value
        motor_GearSpeed_Current += motor_GearSpeed_DELTA
        if (motor_GearSpeed_Current > motor_GearSpeed_MAX) {
            motor_GearSpeed_Current = motor_GearSpeed_MAX
        }
        if (_debug_On) {
            basic.showNumber(motor_GearSpeed_Current)
        }
    } else if (name == "bf") {
        button_F_Value = value
        motor_GearSpeed_Current += -1 * motor_GearSpeed_DELTA
        if (motor_GearSpeed_Current < motor_GearSpeed_MIN) {
            motor_GearSpeed_Current = motor_GearSpeed_MIN
        }
        if (_debug_On) {
            basic.showNumber(motor_GearSpeed_Current)
        }
    } else if (name == "ba") {
        servoArmRight_Degrees_Current = servoArmRight_Degrees_FORWARD
        pins.servoWritePin(AnalogPin.P0, servoArmRight_Degrees_Current)
        if (_debug_On) {
            basic.showNumber(servoArmRight_Degrees_Current)
        }
    } else if (name == "bb") {
        servoArmRight_Degrees_Current = servoArmRight_Degrees_UP
        pins.servoWritePin(AnalogPin.P0, servoArmRight_Degrees_Current)
        if (_debug_On) {
            basic.showNumber(servoArmRight_Degrees_Current)
        }
    } else if (name == "bc") {
        servoArmRight_Degrees_Current = servoArmRight_Degrees_BACKWARD
        pins.servoWritePin(AnalogPin.P0, servoArmRight_Degrees_Current)
        if (_debug_On) {
            basic.showNumber(servoArmRight_Degrees_Current)
        }
    } else {
        _codeComment_AsText = "Invalid State: Unknown 'name'"
    }
    dashboardDisplay_Fn()
    radio.sendValue(name, value)
})
function Motors_SpeedBrake_Turn_ViaJoystickX_Fn() {
    if (joystick_X_Value > joystick_Midpoint + joystick_Deadzone) {
        motorRight_SpeedEnhance_ForTurns = 0
        motorLeft_SpeedEnhance_ForTurns = Math.map(joystick_X_Value, joystick_Midpoint + joystick_Deadzone, joystick_Value_MAX, 0, motor_GearSpeed_Current)
        joystick_X_Value_ForLed_Base1 = Math.map(joystick_X_Value, joystick_Midpoint + joystick_Deadzone, joystick_Value_MAX, 1, 5)
    } else if (joystick_X_Value < joystick_Midpoint - joystick_Deadzone) {
        motorRight_SpeedEnhance_ForTurns = Math.map(joystick_X_Value, joystick_Midpoint - joystick_Deadzone, joystick_Value_MIN, 0, motor_GearSpeed_Current)
        motorLeft_SpeedEnhance_ForTurns = 0
        joystick_X_Value_ForLed_Base1 = Math.map(joystick_X_Value, joystick_Midpoint - joystick_Deadzone, joystick_Value_MIN, -1, -5)
    } else {
        _codeComment_AsText = "DeadZone: Do Nothing"
        motorRight_SpeedEnhance_ForTurns = 0
        motorLeft_SpeedEnhance_ForTurns = 0
        joystick_X_Value_ForLed_Base1 = 0
    }
}
function dashboardDisplay_Fn() {
    basic.clearScreen()
    if (true) {
        if (_debug_On) {
            serial.writeString("joystick_Y_Value_ForLed_Base1" + ": " + joystick_Y_Value_ForLed_Base1)
            serial.writeLine("")
        }
        if (joystick_Y_Value_ForLed_Base1 > 0) {
            for (let index_Y = 0; index_Y <= -1 + Math.round(joystick_Y_Value_ForLed_Base1); index_Y++) {
                led.plotBrightness(2, 4 - index_Y, 255)
            }
            if (_debug_On) {
                serial.writeString("" + 0)
                serial.writeLine("")
            }
        } else if (joystick_Y_Value_ForLed_Base1 < 0) {
            for (let index_Y2 = 0; index_Y2 <= Math.abs(1 + Math.round(joystick_Y_Value_ForLed_Base1)); index_Y2++) {
                led.plotBrightness(2, 0 + index_Y2, 255)
            }
            if (_debug_On) {
                serial.writeString("joystick_Y_Value_ForLed_Base1" + ": " + joystick_Y_Value_ForLed_Base1)
                serial.writeLine("")
            }
        } else {
            _codeComment_AsText = "Idle: Do Nothing"
        }
    }
    if (true) {
        if (_debug_On) {
            serial.writeString("joystick_X_Value_ForLed_Base1" + ": " + joystick_X_Value_ForLed_Base1)
            serial.writeLine("")
        }
        if (joystick_X_Value_ForLed_Base1 > 0) {
            for (let index_X = 0; index_X <= -1 + Math.round(joystick_X_Value_ForLed_Base1); index_X++) {
                led.plotBrightness(index_X, 2, 255)
            }
            if (_debug_On) {
                serial.writeString("joystick_X_Value_ForLed_Base1" + ": " + joystick_X_Value_ForLed_Base1)
                serial.writeLine("")
            }
        } else if (joystick_X_Value_ForLed_Base1 < 0) {
            for (let index_X2 = 0; index_X2 <= Math.abs(1 + Math.round(joystick_X_Value_ForLed_Base1)); index_X2++) {
                led.plotBrightness(4 - index_X2, 2, 255)
            }
            if (_debug_On) {
                serial.writeString("joystick_X_Value_ForLed_Base1" + ": " + joystick_X_Value_ForLed_Base1)
                serial.writeLine("")
            }
        } else {
            _codeComment_AsText = "Idle: Do Nothing"
        }
    }
    if (true) {
        if (motor_GearSpeed_Current >= motor_GearSpeed_DELTA * 1) {
            led.plotBrightness(0, 1, dashboardDisplay_Brightness_LO)
        }
        if (motor_GearSpeed_Current >= motor_GearSpeed_DELTA * 2) {
            led.plotBrightness(1, 1, dashboardDisplay_Brightness_LO)
        }
        if (motor_GearSpeed_Current >= motor_GearSpeed_DELTA * 3) {
            led.plotBrightness(0, 0, dashboardDisplay_Brightness_LO)
            led.plotBrightness(1, 0, dashboardDisplay_Brightness_LO)
        }
    }
    if (true) {
        if (servoArmRight_Degrees_Current == servoArmRight_Degrees_UP || servoArmRight_Degrees_Current == servoArmRight_Degrees_FORWARD || servoArmRight_Degrees_Current == servoArmRight_Degrees_BACKWARD) {
            led.plotBrightness(3, 0, dashboardDisplay_Brightness_LO)
            led.plotBrightness(4, 0, dashboardDisplay_Brightness_LO)
        }
        if (servoArmRight_Degrees_Current == servoArmRight_Degrees_FORWARD) {
            led.plotBrightness(3, 1, dashboardDisplay_Brightness_LO)
        }
        if (servoArmRight_Degrees_Current == servoArmRight_Degrees_BACKWARD) {
            led.plotBrightness(4, 1, dashboardDisplay_Brightness_LO)
        }
    }
    if (true) {
        if (true) {
            for (let index_X3 = 0; index_X3 <= Math.idiv(motorRight_SpeedCore_SlowerForDriftControl, motor_SpeedCore_SlowerForDriftControl_DELTA) - 1; index_X3++) {
                led.plotBrightness(index_X3, 4, dashboardDisplay_Brightness_LO)
            }
            if (_debug_On) {
                serial.writeString("motorRight_SpeedCore_SlowerForDriftControl: " + motorRight_SpeedCore_SlowerForDriftControl)
                serial.writeLine("")
            }
        }
        if (true) {
            for (let index_X4 = 0; index_X4 <= Math.idiv(motorLeft_SpeedCore_SlowerForDriftControl, motor_SpeedCore_SlowerForDriftControl_DELTA) - 1; index_X4++) {
                led.plotBrightness(4 - index_X4, 4, dashboardDisplay_Brightness_LO)
            }
            if (_debug_On) {
                serial.writeString("motorLeft_SpeedCore_SlowerForDriftControl: " + motorLeft_SpeedCore_SlowerForDriftControl)
                serial.writeLine("")
            }
        }
    }
}
function Motors_Drive_Fn() {
    motor_Right_Speed_Total = motorRight_SpeedCore_ForStraight + motorRight_SpeedEnhance_ForTurns
    motor_Left_Speed_Total = motorLeft_SpeedCore_ForStraight + motorLeft_SpeedEnhance_ForTurns
    _codeComment_AsText = "Directional Rotation from Perspective of Driver sitting facing-forward in Bot"
    motor.MotorRun(motor.Motors.M1, motor.Dir.CCW, motor_Right_Speed_Total)
    motor.MotorRun(motor.Motors.M4, motor.Dir.CW, motor_Left_Speed_Total)
    if (_debug_On) {
        serial.writeString(" >> ")
        serial.writeString("L " + Math.round(motor_Left_Speed_Total) + " - R " + Math.round(motor_Right_Speed_Total))
        serial.writeLine("")
    }
}
function Motors_Setup_AntiDriftControl_Persistent_Fn() {
    if (true) {
        motorRight_SpeedCore_SlowerForDriftControl = 0
        if (pins.digitalReadPin(DigitalPin.P16) == 1) {
            motorRight_SpeedCore_SlowerForDriftControl += motor_SpeedCore_SlowerForDriftControl_DELTA
            motorLeft_SpeedCore_SlowerForDriftControl += -1 * motor_SpeedCore_SlowerForDriftControl_DELTA
        }
        if (pins.digitalReadPin(DigitalPin.P15) == 1) {
            motorRight_SpeedCore_SlowerForDriftControl += motor_SpeedCore_SlowerForDriftControl_DELTA
            motorLeft_SpeedCore_SlowerForDriftControl += -1 * motor_SpeedCore_SlowerForDriftControl_DELTA
        }
    }
    if (true) {
        motorLeft_SpeedCore_SlowerForDriftControl = 0
        if (pins.digitalReadPin(DigitalPin.P14) == 1) {
            motorLeft_SpeedCore_SlowerForDriftControl += motor_SpeedCore_SlowerForDriftControl_DELTA
        }
        if (pins.digitalReadPin(DigitalPin.P13) == 1) {
            motorLeft_SpeedCore_SlowerForDriftControl += motor_SpeedCore_SlowerForDriftControl_DELTA
        }
    }
}
let joystick_X_Value_ForLed_Base1 = 0
let motorLeft_SpeedEnhance_ForTurns = 0
let motorRight_SpeedEnhance_ForTurns = 0
let joystick_X_Value = 0
let joystick_Y_Value_ForLed_Base1 = 0
let motorLeft_SpeedCore_SlowerForDriftControl = 0
let motorLeft_SpeedCore_ForStraight = 0
let motorRight_SpeedCore_SlowerForDriftControl = 0
let motorRight_SpeedCore_ForStraight = 0
let joystick_Y_Value = 0
let servoArmRight_Degrees_Current = 0
let servoArmRight_Degrees_BACKWARD = 0
let servoArmRight_Degrees_UP = 0
let servoArmRight_Degrees_FORWARD = 0
let servo_Degrees_DELTA = 0
let dashboardDisplay_Brightness_HI = 0
let dashboardDisplay_Brightness_LO = 0
let _debug_On = false
let button_E_Value = 0
let button_F_Value = 0
let motor_SpeedCore_SlowerForDriftControl_DELTA = 0
let motor_GearSpeed_Current = 0
let motor_GearSpeed_MAX = 0
let motor_GearSpeed_MIN = 0
let motor_GearSpeed_DELTA = 0
let joystick_Midpoint = 0
let joystick_Value = 0
let joystick_Deadzone = 0
let joystick_Value_MIN = 0
let joystick_Value_MAX = 0
let _codeComment_AsText = ""
let motor_Right_Speed_Total = 0
let motor_Left_Speed_Total = 0
if (true) {
    motor_Right_Speed_Total = 0
    motor_Left_Speed_Total = 0
}
if (true) {
    radio.setGroup(25)
}
if (true) {
    _codeComment_AsText = "For one MicroBit, MinX=1, MidX=526, MaxX=989; MinY=1, MidY=511, MaxY=1019"
    joystick_Value_MAX = 1024
    joystick_Value_MIN = 0
    _codeComment_AsText = "Deadzone was 20, yet do 30 for safety buffer"
    // Was 100, 50, now 0 Complete 100% responsiveness,
    // yet seems 20 is best for DeadZone
    joystick_Deadzone = 30
    joystick_Value = 0
    joystick_Midpoint = joystick_Value_MAX / 2
}
if (true) {
    _codeComment_AsText = "Tests show 50 is not strong enough for pivot turn, so 60 is barely ok, so start with 70-75."
    _codeComment_AsText = "Have 3 GearLevels: 75, 150, 225 (which is close enough to 255 during testing)"
    motor_GearSpeed_DELTA = 75
    // 70% of 255 = 178.5
    motor_GearSpeed_MIN = 75
    motor_GearSpeed_MAX = 225
    motor_GearSpeed_Current = motor_GearSpeed_MIN
    basic.showNumber(motor_GearSpeed_Current)
    // * was 5 not significant enough,
    //
    // * try 10
    //
    // * try 20 (at 40 seems pretty good)
    //
    // * try 30 (60 switched to other side)
    //
    // * try 10/-10
    //
    motor_SpeedCore_SlowerForDriftControl_DELTA = 10
    Motors_Setup_AntiDriftControl_Persistent_Fn()
}
if (true) {
    button_F_Value = 0
    button_E_Value = 0
}
if (true) {
    _debug_On = false
    // * 127 not much dimmer,
    //
    // * try 63, not bad
    //
    // * try 31
    //
    // * switch back to brightest
    //
    dashboardDisplay_Brightness_LO = 31
    dashboardDisplay_Brightness_HI = 255
}
if (true) {
    _codeComment_AsText = "Degrees from perspective of Driver Sitting in Bot, 0 to 180 degrees CCW"
    servo_Degrees_DELTA = 90
    servoArmRight_Degrees_FORWARD = 180
    servoArmRight_Degrees_UP = 90
    servoArmRight_Degrees_BACKWARD = 0
    servoArmRight_Degrees_Current = servoArmRight_Degrees_UP
    pins.servoWritePin(AnalogPin.P0, servoArmRight_Degrees_Current)
}
