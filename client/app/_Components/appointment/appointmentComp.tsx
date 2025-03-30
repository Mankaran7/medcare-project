"use client";

import Calendar from "../Calender/showCalender";
import style from "./booking.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "../../providers/loginProvider";

interface Doctor {
    id: number;
    name: string;
    degree: string;
    specialty: string;
    experience: string;
    rating: number;
    image: string;
    designation?: string;
    hospital?: string;
    about?: string;
    education?: string[];
    nextAvailable?: string;
}

interface AppointmentProps {
    doctor: Doctor;
}

interface TimeSlot {
    time: string;
    isAvailable: boolean;
    id?: number;
}

interface ServerSlot {
    id: number;
    doctor_id: number;
    date: string;
    time_slot: string;
    is_available: boolean;
}

export default function Appointment({ doctor }: AppointmentProps) {
    const router = useRouter();
    const { user } = useLogin();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [offlineMode, setOfflineMode] = useState(true);
    const [HospitalList] = useState([
        "MediCareHeart Institute, Okhla Road",
    ]);

    const defaultMorningSlots: TimeSlot[] = [
        { time: "9:00 AM", isAvailable: true },
        { time: "9:30 AM", isAvailable: true },
        { time: "10:00 AM", isAvailable: true },
        { time: "10:30 AM", isAvailable: true },
        { time: "11:00 AM", isAvailable: true },
        { time: "11:30 AM", isAvailable: true },
        { time: "12:00 PM", isAvailable: true },
        { time: "12:30 PM", isAvailable: true },
    ];

    const defaultEveningSlots: TimeSlot[] = [
        { time: "4:00 PM", isAvailable: true },
        { time: "4:30 PM", isAvailable: true },
        { time: "5:00 PM", isAvailable: true },
        { time: "5:30 PM", isAvailable: true },
        { time: "6:00 PM", isAvailable: true },
        { time: "6:30 PM", isAvailable: true },
        { time: "7:00 PM", isAvailable: true },
        { time: "7:30 PM", isAvailable: true }
    ];

    const [morningSlots, setMorningSlots] = useState<TimeSlot[]>(defaultMorningSlots);
    const [eveningSlots, setEveningSlots] = useState<TimeSlot[]>(defaultEveningSlots);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [serverSlots, setServerSlots] = useState<ServerSlot[]>([]);
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        const fetchAvailableSlots = async () => {
            try {
                setLoading(true);
                setError("");

                const formattedDate = selectedDate.toISOString().split('T')[0];
                const response = await fetch(
                    `/api/appointments/available-slots/${doctor.id}/${formattedDate}`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch slots');
                }

                const availableSlots: ServerSlot[] = await response.json();
                setServerSlots(availableSlots);

                const updatedMorningSlots = defaultMorningSlots.map(slot => {
                    const matchedSlot = availableSlots.find(serverSlot => {
                        const serverTime = convertTo12HourFormat(serverSlot.time_slot);
                        return serverTime === slot.time;
                    });
                    return {
                        ...slot,
                        isAvailable: matchedSlot ? matchedSlot.is_available : true
                    };
                });

                const updatedEveningSlots = defaultEveningSlots.map(slot => {
                    const matchedSlot = availableSlots.find(serverSlot => {
                        const serverTime = convertTo12HourFormat(serverSlot.time_slot);
                        return serverTime === slot.time;
                    });
                    return {
                        ...slot,
                        isAvailable: matchedSlot ? matchedSlot.is_available : true
                    };
                });

                setMorningSlots(updatedMorningSlots);
                setEveningSlots(updatedEveningSlots);
            } catch (err: any) {
                setError("Failed to load available slots");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAvailableSlots();
    }, [selectedDate, doctor.id]);

    const handleDateChange = (date: Date) => {
        if (date.getTime() !== selectedDate.getTime()) {
            setSelectedDate(date);
            setSelectedTime(null);
            setSelectedSlot(null);
        }
    };

    const handleToggle = (isOffline: boolean) => {
        setOfflineMode(isOffline);
    };

    const handleSlotSelection = (slot: TimeSlot) => {
        setSelectedTime(slot.time);
        setSelectedSlot(null);
    };

    const handleNext = async () => {
        if (!selectedTime) {
            setError("Please select a time slot");
            return;
        }

        if (!user) {
            const appointmentIntent = {
                doctorId: doctor.id,
                doctorName: doctor.name,
                date: selectedDate.toISOString(),
                time: selectedTime,
                mode: offlineMode ? 'offline' : 'online'
            };
            localStorage.setItem('appointmentIntent', JSON.stringify(appointmentIntent));
            
            const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
            router.push(`/login?returnUrl=${returnUrl}`);
            return;
        }

        try {
            setIsBooking(true);
            setError("");
            
            const timeSlot = convertTo24HourFormat(selectedTime);
            const formattedDate = selectedDate.toISOString().split('T')[0];

            const response = await fetch('/api/appointments/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    doctorId: doctor.id,
                    timeSlot: timeSlot,
                    date: formattedDate,
                    mode: offlineMode ? 'offline' : 'online'
                })
            });

            if (!response.ok) {
                throw new Error('Failed to book appointment');
            }

            localStorage.removeItem('appointmentIntent');

            router.push(
                `/appointments/success?${new URLSearchParams({
                    doctorName: doctor.name,
                    date: formattedDate,
                    time: selectedTime,
                    mode: offlineMode ? 'Hospital Visit' : 'Video Consultation',
                    status: 'pending'
                }).toString()}`
            );
        } catch (err: any) {
            setError(err.message || "Failed to book appointment");
            console.error("Appointment booking error:", err);
        } finally {
            setIsBooking(false);
        }
    };

    const convertTo12HourFormat = (time: string) => {
        const [hours, minutes] = time.split(':');
        let hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12 || 12;
        return `${hour}:${minutes} ${period}`;
    };

    const convertTo24HourFormat = (time: string) => {
        const [timePart, period] = time.split(' ');
        const [hours, minutes] = timePart.split(':');
        let hour = parseInt(hours);
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        return `${hour.toString().padStart(2, '0')}:${minutes}`;
    };

    const availableMorningCount = morningSlots.filter(slot => slot.isAvailable).length;
    const availableEveningCount = eveningSlots.filter(slot => slot.isAvailable).length;

    return (
        <main className={style.main}>
            {isBooking && (
                <div className={style.loadingOverlay}>
                    <div className={style.loadingSpinner}></div>
                    <p>Booking your appointment...</p>
                </div>
            )}
            <div className={style.info}>
                <h1>Book your next doctor's visit in Seconds</h1>
                <p>
                    Medcare helps you find the best healthcare provider by
                    specialty, location, and more, ensuring you get the care you
                    need.
                </p>
            </div>
            <div className={style.slotsBackground}>
                <div className={style.slots}>
                    <div className={style.schedule}>
                        <p>Schedule Appointment</p>
                        <button>Book Appointment</button>
                    </div>
                    <div className={style.consult}>
                        <button
                            className={!offlineMode ? style.bgGreen : style.White}
                            onClick={() => handleToggle(false)}
                        >
                            Book Video Consult
                        </button>
                        <button
                            className={offlineMode ? style.bgGreen : style.White}
                            onClick={() => handleToggle(true)}
                        >
                            Book Hospital Visit
                        </button>
                    </div>
                    <select className={style.hospitalList}>
                        {HospitalList.map((hospital, index) => (
                            <option key={index}>{hospital}</option>
                        ))}
                    </select>
                    <Calendar onDateChange={handleDateChange} />
                    
                    {error && <div className={style.error}>{error}</div>}
                    {loading ? (
                        <div className={style.loadingContainer}>
                            <div className={style.loadingSpinner}></div>
                            <p>Loading available slots...</p>
                        </div>
                    ) : (
                        <>
                    <div className={style.availableSlots}>
                        <div className={style.sunCountOfSlots}>
                            <div className={style.sunMorning}>
                                <div className={style.sun}></div>
                                <div className={style.morning}>Morning</div>
                            </div>
                            <div className={style.countOfSlots}>
                                        <span>Slots {availableMorningCount}</span>
                            </div>
                        </div>
                        <div className={style.horizontalLine}></div>
                        <div className={style.availableSlotsContainer}>
                                    {morningSlots.map((slot, index) => (
                                    <button
                                            key={index}
                                            onClick={() => handleSlotSelection(slot)}
                                            className={`${style.slotButton} ${
                                                selectedTime === slot.time ? style.bgGreen : ''
                                            } ${!slot.isAvailable ? style.disabled : ''}`}
                                            disabled={!slot.isAvailable}
                                        >
                                            {slot.time}
                                    </button>
                                    ))}
                        </div>
                    </div>

                    <div className={style.availableSlots}>
                        <div className={style.sunCountOfSlots}>
                            <div className={style.sunMorning}>
                                <div className={style.sunset}></div>
                                <div className={style.morning}>Evening</div>
                            </div>
                            <div className={style.countOfSlots}>
                                        <span>Slots {availableEveningCount}</span>
                            </div>
                        </div>
                        <div className={style.horizontalLine}></div>
                        <div className={style.availableSlotsContainer}>
                                    {eveningSlots.map((slot, index) => (
                                    <button
                                            key={index}
                                            onClick={() => handleSlotSelection(slot)}
                                            className={`${style.slotButton} ${
                                                selectedTime === slot.time ? style.bgGreen : ''
                                            } ${!slot.isAvailable ? style.disabled : ''}`}
                                            disabled={!slot.isAvailable}
                                        >
                                            {slot.time}
                                    </button>
                                    ))}
                        </div>
                    </div>
                        </>
                    )}
                    
                    <button
                        className={style.nextButton}
                        onClick={handleNext}
                        disabled={loading || !selectedTime || isBooking}
                    >
                        {isBooking ? 'Booking...' : 'Next'}
                    </button>
                </div>
            </div>
        </main>
    );
}
