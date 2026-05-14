export type FieldType = 'text' | 'email' | 'phone' | 'date' | 'time' | 'select' | 'status_chip' | 'textarea';

export interface ColumnConfig {
  field: string;
  header: string;
  type: FieldType;
  options?: string[]; 
  flex?: number;
  minWidth?: number;
  required?: boolean;
}


export interface DashboardMetricConfig {
  key: string;
  label: string;
  type: 'count' | 'filter_count' | 'today_count' | 'this_month_count' | 'date_gte_today';
  filterField?: string;
  filterValue?: string | number | boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  icon?: string;
}

export interface TableConfig {
  id: string;
  title: string;
  endpoint: string; // The API endpoint to fetch data from
  columns: ColumnConfig[];
  metrics?: DashboardMetricConfig[];
}

export interface ClientConfig {
  appName: string;
  theme: { primaryColor: string };
  tables: TableConfig[];
}

export const ClientRegistry: Record<string, ClientConfig> = {
  pixeleye: {
    appName: "PixelEye",
    theme: { primaryColor: "#1F6B40" },
    tables: [
      {
        id: "leads",
        title: "PixelEye Leads",
        endpoint: "/pixeleye",
        columns: [
          { field: "date", header: "Date", type: "date", required: true },
          { field: "time", header: "Time", type: "time", required: true },
          { field: "call_id", header: "Call ID", type: "text", required: true },
          { field: "customer_name", header: "Customer Name", type: "text", required: true },
          { field: "phone_number", header: "Phone Number", type: "phone", required: true },
          { field: "agent_name", header: "Agent Name", type: "text", required: false },
          { field: "source", header: "Source", type: "text", required: false },
          { field: "type_of_enquiry", header: "Type of Enquiry", type: "text", required: false },
          { field: "follow_up_date", header: "Follow Up Date", type: "date", required: false },
          {
            field: "status", header: "Status", type: "status_chip", required: true, options: [
              "Busy", "Not Answering", "Switched Off", "Missed Call", "On Another Call", "DND", "Dnp 2", "Not Speaking", "Disconnecting", "Not in Network", "Incoming Call Not Available", "Number Not in Service", "Wrong Number", "Wrongly Dialed", "Fraud Call", "Enquiry", "Hot Follow-up", "Follow-up Required", "Will Call Later", "Rescheduling", "Doctor Time", "Follow-up Post Appointment", "Want to Speak With Doctor", "Appointment Fixed", "Appointment Cancelled", "Visited", "Walk-in", "Not Interested", "Not Willing to Come Now", "Searching for Specific Hospital", "Going to Other Hospital", "Not in Hyderabad", "Long Distance", "Address Requested", "Closed", "Others"
            ]
          },
          {
            field: "day_1", header: "Day 1", type: "status_chip", required: false, options: [
              "Busy", "Not Answering", "Switched Off", "Missed Call", "On Another Call", "DND", "Dnp 2", "Not Speaking", "Disconnecting", "Not in Network", "Incoming Call Not Available", "Number Not in Service", "Wrong Number", "Wrongly Dialed", "Fraud Call", "Enquiry", "Hot Follow-up", "Follow-up Required", "Will Call Later", "Rescheduling", "Doctor Time", "Follow-up Post Appointment", "Want to Speak With Doctor", "Appointment Fixed", "Appointment Cancelled", "Visited", "Walk-in", "Not Interested", "Not Willing to Come Now", "Searching for Specific Hospital", "Going to Other Hospital", "Not in Hyderabad", "Long Distance", "Address Requested", "Closed", "Others"
            ]
          },
          {
            field: "day_2", header: "Day 2", type: "status_chip", required: false, options: [
              "Busy", "Not Answering", "Switched Off", "Missed Call", "On Another Call", "DND", "Dnp 2", "Not Speaking", "Disconnecting", "Not in Network", "Incoming Call Not Available", "Number Not in Service", "Wrong Number", "Wrongly Dialed", "Fraud Call", "Enquiry", "Hot Follow-up", "Follow-up Required", "Will Call Later", "Rescheduling", "Doctor Time", "Follow-up Post Appointment", "Want to Speak With Doctor", "Appointment Fixed", "Appointment Cancelled", "Visited", "Walk-in", "Not Interested", "Not Willing to Come Now", "Searching for Specific Hospital", "Going to Other Hospital", "Not in Hyderabad", "Long Distance", "Address Requested", "Closed", "Others"
            ]
          },
          {
            field: "day_3", header: "Day 3", type: "status_chip", required: false, options: [
              "Busy", "Not Answering", "Switched Off", "Missed Call", "On Another Call", "DND", "Dnp 2", "Not Speaking", "Disconnecting", "Not in Network", "Incoming Call Not Available", "Number Not in Service", "Wrong Number", "Wrongly Dialed", "Fraud Call", "Enquiry", "Hot Follow-up", "Follow-up Required", "Will Call Later", "Rescheduling", "Doctor Time", "Follow-up Post Appointment", "Want to Speak With Doctor", "Appointment Fixed", "Appointment Cancelled", "Visited", "Walk-in", "Not Interested", "Not Willing to Come Now", "Searching for Specific Hospital", "Going to Other Hospital", "Not in Hyderabad", "Long Distance", "Address Requested", "Closed", "Others"
            ]
          },
          {
            field: "day_4", header: "Day 4", type: "status_chip", required: false, options: [
              "Busy", "Not Answering", "Switched Off", "Missed Call", "On Another Call", "DND", "Dnp 2", "Not Speaking", "Disconnecting", "Not in Network", "Incoming Call Not Available", "Number Not in Service", "Wrong Number", "Wrongly Dialed", "Fraud Call", "Enquiry", "Hot Follow-up", "Follow-up Required", "Will Call Later", "Rescheduling", "Doctor Time", "Follow-up Post Appointment", "Want to Speak With Doctor", "Appointment Fixed", "Appointment Cancelled", "Visited", "Walk-in", "Not Interested", "Not Willing to Come Now", "Searching for Specific Hospital", "Going to Other Hospital", "Not in Hyderabad", "Long Distance", "Address Requested", "Closed", "Others"
            ]
          },
          {
            field: "day_5", header: "Day 5", type: "status_chip", required: false, options: [
              "Busy", "Not Answering", "Switched Off", "Missed Call", "On Another Call", "DND", "Dnp 2", "Not Speaking", "Disconnecting", "Not in Network", "Incoming Call Not Available", "Number Not in Service", "Wrong Number", "Wrongly Dialed", "Fraud Call", "Enquiry", "Hot Follow-up", "Follow-up Required", "Will Call Later", "Rescheduling", "Doctor Time", "Follow-up Post Appointment", "Want to Speak With Doctor", "Appointment Fixed", "Appointment Cancelled", "Visited", "Walk-in", "Not Interested", "Not Willing to Come Now", "Searching for Specific Hospital", "Going to Other Hospital", "Not in Hyderabad", "Long Distance", "Address Requested", "Closed", "Others"
            ]
          },
        ],
      },
    ],
  },
  vls_law: {
    appName: "VLS Law",
    theme: { primaryColor: "#800020" },
    tables: [

      // ── TABLE 1: LAW PRACTICE ──────────────────────────────────────────────
      {
        id: "practice",
        title: "Law Practice Enrollments",
        endpoint: "/dynamic/vlslaw_practice",
        columns: [
          { field: "name", header: "Name", type: "text", flex: 1.3, minWidth: 150, required: true },
          { field: "mobile", header: "Mobile", type: "phone", flex: 1.1, minWidth: 130 },
          { field: "email", header: "Email", type: "email", flex: 1.3, minWidth: 160 },
          { field: "amount", header: "Amount (₹)", type: "text", flex: 0.9, minWidth: 110 },
          { field: "registered_date", header: "Registered On", type: "date", flex: 1, minWidth: 130, required: true },
          { field: "programm_date", header: "Program Date", type: "date", flex: 1, minWidth: 130, required: true },
          {
            field: "payment_status",
            header: "Payment",
            type: "status_chip",
            flex: 1.1,
            minWidth: 130,
            required: true,
            options: ["paid", "attempted", "failed", "cancelled"],
          },
          {
            field: "page_name",
            header: "Program",
            type: "select",
            flex: 1.4,
            minWidth: 200,
            required: true,
            options: ["decoding-of-practice", "decoding-of-law-practice"],
          },
          { field: "razorpay_order_id", header: "Order ID", type: "text", flex: 1.2, minWidth: 160 },
          { field: "razorpay_payment_id", header: "Payment ID", type: "text", flex: 1.2, minWidth: 160 },
          { field: "utm_source", header: "UTM Source", type: "text", flex: 1, minWidth: 120 },
        ],
        metrics: [
          { key: "practice_total", label: "Total Enrollments", type: "count", color: "primary", icon: "mingcute:briefcase-line" },
          { key: "practice_today", label: "Today's Enrollments", type: "today_count", filterField: "registered_date", color: "info", icon: "mingcute:calendar-2-line" },
          { key: "practice_month", label: "This Month", type: "this_month_count", filterField: "registered_date", color: "secondary", icon: "mingcute:calendar-month-line" },
          { key: "practice_paid", label: "Paid", type: "filter_count", filterField: "payment_status", filterValue: "paid", color: "success", icon: "mingcute:currency-rupee-line" },
          { key: "practice_attempted", label: "Attempted", type: "filter_count", filterField: "payment_status", filterValue: "attempted", color: "warning", icon: "mingcute:time-line" },
          { key: "practice_failed", label: "Failed", type: "filter_count", filterField: "payment_status", filterValue: "failed", color: "error", icon: "mingcute:close-circle-line" },
        ],
      },

      // ── TABLE 2: LAW ACADEMY ───────────────────────────────────────────────
      {
        id: "academy",
        title: "Law Academy Inquiries",
        endpoint: "/dynamic/vlslaw_academy",
        columns: [
          { field: "name", header: "Name", type: "text", flex: 1.3, minWidth: 150 },
          { field: "mobile", header: "Mobile", type: "phone", flex: 1.1, minWidth: 130 },
          { field: "email", header: "Email", type: "email", flex: 1.3, minWidth: 160 },
          { field: "message", header: "Message", type: "textarea", flex: 2, minWidth: 220 },
          { field: "registered_date", header: "Inquiry Date", type: "date", flex: 1, minWidth: 130, required: true },
          { field: "utm_source", header: "UTM Source", type: "text", flex: 1, minWidth: 120 },
        ],
        metrics: [
          { key: "academy_total", label: "Total Inquiries", type: "count", color: "primary", icon: "mingcute:user-question-line" },
          { key: "academy_today", label: "Today's Inquiries", type: "today_count", filterField: "registered_date", color: "info", icon: "mingcute:calendar-2-line" },
          { key: "academy_month", label: "This Month", type: "this_month_count", filterField: "registered_date", color: "success", icon: "mingcute:calendar-month-line" },
        ],
      },

      // ── TABLE 3: AIBE ──────────────────────────────────────────────────────
      {
        id: "aibe",
        title: "AIBE Exam Registrations",
        endpoint: "/dynamic/vlslaw_aibe",
        columns: [
          { field: "name", header: "Name", type: "text", flex: 1.3, minWidth: 150 },
          { field: "mobile", header: "Mobile", type: "phone", flex: 1.1, minWidth: 130 },
          { field: "email", header: "Email", type: "email", flex: 1.3, minWidth: 160 },
          { field: "amount", header: "Amount (₹)", type: "text", flex: 0.9, minWidth: 110 },
          { field: "registered_date", header: "Registered On", type: "date", flex: 1, minWidth: 130, required: true },
          { field: "programm_start_date", header: "Program Start", type: "date", flex: 1, minWidth: 130, required: true },
          { field: "programm_end_date", header: "Program End", type: "date", flex: 1, minWidth: 130, required: true },
          {
            field: "payment_status",
            header: "Payment",
            type: "status_chip",
            flex: 1.1,
            minWidth: 130,
            required: true,
            options: ["paid", "attempted", "failed", "cancelled"],
          },
          { field: "razorpay_order_id", header: "Order ID", type: "text", flex: 1.2, minWidth: 160 },
          { field: "razorpay_payment_id", header: "Payment ID", type: "text", flex: 1.2, minWidth: 160 },
          { field: "utm_source", header: "UTM Source", type: "text", flex: 1, minWidth: 120 },
        ],
        metrics: [
          { key: "aibe_total", label: "Total Registrations", type: "count", color: "primary", icon: "mingcute:certificate-line" },
          { key: "aibe_paid", label: "Paid Candidates", type: "filter_count", filterField: "payment_status", filterValue: "paid", color: "success", icon: "mingcute:currency-rupee-line" },
          { key: "aibe_attempted", label: "Attempted", type: "filter_count", filterField: "payment_status", filterValue: "attempted", color: "warning", icon: "mingcute:time-line" },
          { key: "aibe_failed", label: "Failed Payments", type: "filter_count", filterField: "payment_status", filterValue: "failed", color: "error", icon: "mingcute:close-circle-line" },
          { key: "aibe_active", label: "Active Programs", type: "date_gte_today", filterField: "programm_end_date", color: "info", icon: "mingcute:calendar-check-line" },
        ],
      },

    ]
  }
};
