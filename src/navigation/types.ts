// User Bottom Tabs
export type UserTabParamList = {
  UserHomeTab: undefined;
  MembershipTab: undefined;
  BookPTTab: undefined;
  UserClassesTab: undefined;
  ProfileTab: undefined;
};

// PT Bottom Tabs
export type PTTabParamList = {
  PTHomeTab: undefined;
  TeachingScheduleTab: undefined;
  PTClassesTab: undefined;
  MembershipTab: undefined;
  ProfileTab: undefined;
};

// Root Stack Navigator
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  UserHome: undefined;
  PTHome: undefined;
  UserTabs: undefined;
  PTTabs: undefined;
  Notifications: undefined;
  LocationsTest: undefined;
  Profile: undefined;
  Settings: undefined;
  MySchedule: undefined;
  // Profile related screens
  PersonalInfo: undefined;
  FitnessProgress: undefined;
  AddEditProgress: {
    progressId?: string; // undefined = create mode, string = edit mode
    progressData?: any;
  };
  CheckInOutHistory: undefined;
  PaymentHistory: undefined;
  Revenue: undefined;
  ChangePassword: undefined;
  // Membership detail screen
  MembershipDetail: {
    membership?: any;
    package?: any;
    isMyMembership: boolean;
  };
  // VNPay WebView screen
  VNPayWebView: {
    paymentUrl: string;
  };
  // Payment result screens
  PaymentSuccess: undefined;
  PaymentFailed: {
    errorMessage?: string;
  };
  // Booking PT screens
  TrainerDetail: {
    trainerId: string;
    selectedDate: string; // ISO date string
  };
  BookingDetail: {
    trainerId: string;
    bookingType: 'upcoming' | 'history';
  };
  // Class enrollment screens
  ClassDetail: {
    classId: string;
  };
};
