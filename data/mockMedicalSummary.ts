import { MedicalSummary } from "@/types/medical";

export const MOCK_TRANSCRIPT = [
  "The patient has symptoms consistent with an uncomplicated sinus infection.",
  "Start amoxicillin 500mg three times daily, morning, afternoon, and night, for 7 days. Take it after food.",
  "Use saline nasal spray twice daily for congestion.",
  "Drink more water, rest, and avoid strenuous exercise until the fever has settled.",
  "Book a follow-up appointment on 20 May 2026 if symptoms are not improving.",
  "Seek medical help urgently if breathing becomes difficult, fever gets worse, or a rash appears.",
  "There was some background noise while discussing optional pain relief, so confirm any extra medication before adding it."
].join(" ");

export const MOCK_MEDICAL_SUMMARY: MedicalSummary = {
  patientSummary:
    "You have symptoms that fit with an uncomplicated sinus infection. Take the prescribed antibiotic as directed, use saline spray for congestion, rest, and watch for any worsening symptoms.",
  tasks: [
    {
      task: "Drink more water",
      details: "Aim for about 2 litres per day unless your doctor has told you to restrict fluids."
    },
    {
      task: "Rest and recover",
      details: "Avoid strenuous exercise until your fever has settled and your energy is improving."
    },
    {
      task: "Use saline spray",
      details: "Use the spray as directed to help relieve nasal congestion."
    }
  ],
  medications: [
    {
      name: "Amoxicillin",
      dosage: "500mg",
      frequency: "3 times daily",
      times: ["Morning", "Afternoon", "Night"],
      duration: "7 days",
      instructions: "Take after food. Finish the full course unless your doctor tells you to stop."
    },
    {
      name: "Saline nasal spray",
      dosage: "1 spray per nostril",
      frequency: "Twice daily",
      times: ["Morning", "Night"],
      duration: "7 days",
      instructions: "Use for congestion. Stop if irritation occurs."
    }
  ],
  followUp: {
    required: true,
    date: "2026-05-20",
    notes: "Book a follow-up appointment if symptoms do not improve or if you feel worse."
  },
  warnings: [
    "Seek medical help if symptoms worsen.",
    "Get urgent care if you develop trouble breathing, a worsening fever, a rash, or severe swelling.",
    "Confirm any additional pain-relief medicine with the doctor before adding it to this plan."
  ],
  doctorApproved: false
};
