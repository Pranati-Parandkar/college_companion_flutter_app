import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

void main() {
  runApp(const CollegeCompanionApp());
}

class CollegeCompanionApp extends StatelessWidget {
  const CollegeCompanionApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'College Companion',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
        useMaterial3: true,
        fontFamily: 'Inter',
      ),
      home: const MainNavigation(),
    );
  }
}

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _selectedIndex = 0;

  static const List<Widget> _screens = [
    DashboardScreen(),
    TimetableScreen(),
    AttendanceScreen(),
    NotesScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.indigo,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_rounded), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.calendar_month_rounded), label: 'Schedule'),
          BottomNavigationBarItem(icon: Icon(Icons.check_circle_rounded), label: 'Attendance'),
          BottomNavigationBarItem(icon: Icon(Icons.book_rounded), label: 'Notes'),
        ],
      ),
    );
  }
}

// Models
class Subject {
  final String id;
  final String name;
  final String day;
  final String startTime;
  final String endTime;
  final String room;
  final String period;
  final String? teacher;

  Subject({
    required this.id,
    required this.name,
    required this.day,
    required this.startTime,
    required this.endTime,
    required this.room,
    required this.period,
    this.teacher,
  });
}

// Data Seed (From Timetable Image)
final List<Subject> initialTimetable = [
  // Monday
  Subject(id: 'm1', name: 'PE-I', day: 'Monday', startTime: '9:10 AM', endTime: '10:10 AM', room: 'L-301', period: 'I'),
  Subject(id: 'm2', name: 'PQT', day: 'Monday', startTime: '10:10 AM', endTime: '11:10 AM', room: 'L-301', period: 'II'),
  Subject(id: 'm3', name: 'EAD', day: 'Monday', startTime: '11:15 AM', endTime: '12:15 PM', room: 'L-301', period: 'III'),
  Subject(id: 'm4', name: 'DBMS', day: 'Monday', startTime: '1:00 PM', endTime: '2:00 PM', room: 'L-301', period: 'IV'),
  Subject(id: 'm5', name: 'EEA', day: 'Monday', startTime: '2:00 PM', endTime: '3:00 PM', room: 'L-301', period: 'V'),
  Subject(id: 'm6', name: 'SPORTS', day: 'Monday', startTime: '3:05 PM', endTime: '4:05 PM', room: 'Ground', period: 'VI'),
  // Tuesday
  Subject(id: 't1', name: 'DBMS', day: 'Tuesday', startTime: '9:10 AM', endTime: '10:10 AM', room: 'L-301', period: 'I'),
  Subject(id: 't2', name: 'EEA', day: 'Tuesday', startTime: '10:10 AM', endTime: '11:10 AM', room: 'L-301', period: 'II'),
  Subject(id: 't3', name: 'PQT', day: 'Tuesday', startTime: '11:15 AM', endTime: '12:15 PM', room: 'L-301', period: 'III'),
  Subject(id: 't4', name: 'DBMS LAB (B1) / EAD LAB (B2)', day: 'Tuesday', startTime: '1:00 PM', endTime: '3:00 PM', room: 'Lab', period: 'IV-V'),
  Subject(id: 't5', name: 'LIBRARY (B3) / MP-I (B3)', day: 'Tuesday', startTime: '3:05 PM', endTime: '4:05 PM', room: 'Lib/Lab', period: 'VI'),
  // ... (Full data can be added here)
];

// Screens
class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 180,
            floating: false,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  color: Colors.indigo,
                  borderRadius: BorderRadius.only(
                    bottomLeft: Radius.circular(40),
                    bottomRight: Radius.circular(40),
                  ),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          radius: 28,
                          backgroundColor: Colors.indigo.shade400,
                          child: const Text('PP', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
                        const SizedBox(width: 16),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Pranati', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                            Text('160124737158', style: TextStyle(color: Colors.indigo.shade100, fontSize: 12)),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('ACADEMIC HUB', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1.5)),
                  const SizedBox(height: 16),
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 2,
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                    children: [
                      _buildMenuCard(Icons.calendar_today, 'Timetable', Colors.blue),
                      _buildMenuCard(Icons.analytics_rounded, 'Attendance', Colors.emerald),
                      _buildMenuCard(Icons.assignment_rounded, 'Assignments', Colors.orange),
                      _buildMenuCard(Icons.notes_rounded, 'Notes', Colors.purple),
                    ],
                  ),
                ],
              ),
            ),
          )
        ],
      ),
    );
  }

  Widget _buildMenuCard(IconData icon, String label, Color color) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: BorderSide(color: Colors.grey.shade100)),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 12),
          Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
        ],
      ),
    );
  }
}

class TimetableScreen extends StatefulWidget {
  const TimetableScreen({super.key});

  @override
  State<TimetableScreen> createState() => _TimetableScreenState();
}

class _TimetableScreenState extends State<TimetableScreen> {
  bool isGridView = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Weekly Schedule', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: Icon(isGridView ? Icons.view_list_rounded : Icons.grid_view_rounded),
            onPressed: () => setState(() => isGridView = !isGridView),
          )
        ],
      ),
      body: isGridView ? const TimetableGridView() : const TimetableListView(),
    );
  }
}

class TimetableGridView extends StatelessWidget {
  const TimetableGridView({super.key});

  @override
  Widget build(BuildContext context) {
    final days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    final periods = ['I', 'II', 'III', 'IV', 'V', 'VI'];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              // Header Row
              Row(
                children: [
                  const _HeaderCell(text: 'DAY / PERIOD'),
                  ...periods.map((p) => _HeaderCell(text: 'PERIOD $p')),
                ],
              ),
              // Day Rows
              ...days.map((day) {
                return Row(
                  children: [
                    _DayCell(text: day),
                    ...periods.map((p) {
                      final subject = initialTimetable.firstWhere(
                        (s) => s.day == day && (s.period == p || s.period.contains(p)),
                        orElse: () => Subject(id: '', name: '', day: '', startTime: '', endTime: '', room: '', period: ''),
                      );
                      return _SubjectCell(subject: subject);
                    }),
                  ],
                );
              }),
            ],
          ),
        ),
      ),
    );
  }
}

class _HeaderCell extends StatelessWidget {
  final String text;
  const _HeaderCell({required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 120,
      height: 50,
      alignment: Alignment.center,
      decoration: BoxDecoration(color: Colors.grey.shade100, border: Border.all(color: Colors.grey.shade200)),
      child: Text(text, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.blueGrey)),
    );
  }
}

class _DayCell extends StatelessWidget {
  final String text;
  const _DayCell({required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 120,
      height: 80,
      alignment: Alignment.center,
      decoration: BoxDecoration(color: Colors.white, border: Border.all(color: Colors.grey.shade100)),
      child: Text(text, style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.indigo)),
    );
  }
}

class _SubjectCell extends StatelessWidget {
  final Subject subject;
  const _SubjectCell({required this.subject});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 140,
      height: 80,
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(color: Colors.white, border: Border.all(color: Colors.grey.shade50)),
      child: subject.name.isEmpty
          ? const SizedBox.shrink()
          : Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: Colors.indigo.shade50, borderRadius: BorderRadius.circular(12)),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(subject.name, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.indigo), textAlign: TextAlign.center, maxLines: 2),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.room, size: 8, color: Colors.grey),
                      Text(subject.room, style: const TextStyle(fontSize: 8, color: Colors.grey)),
                    ],
                  ),
                ],
              ),
            ),
    );
  }
}

class TimetableListView extends StatelessWidget {
  const TimetableListView({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: initialTimetable.length,
      itemBuilder: (context, index) {
        final s = initialTimetable[index];
        return Card(
          elevation: 0,
          color: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: Colors.grey.shade100)),
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            contentPadding: const EdgeInsets.all(16),
            leading: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(s.period, style: const TextStyle(fontWeight: FontWeight.w900, color: Colors.indigo)),
                Text(s.day.substring(0, 3).toUpperCase(), style: const TextStyle(fontSize: 9, color: Colors.grey)),
              ],
            ),
            title: Text(s.name, style: const TextStyle(fontWeight: FontWeight.bold)),
            subtitle: Text('${s.startTime} - ${s.endTime} • ${s.room}', style: const TextStyle(fontSize: 12)),
          ),
        );
      },
    );
  }
}

class AttendanceScreen extends StatelessWidget {
  const AttendanceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Attendance Tracking', style: TextStyle(fontWeight: FontWeight.bold))),
      body: const Center(child: Text('Attendance Logic Here')),
    );
  }
}

class NotesScreen extends StatelessWidget {
  const NotesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Notes', style: TextStyle(fontWeight: FontWeight.bold))),
      body: const Center(child: Text('Notes Logic Here')),
    );
  }
}
