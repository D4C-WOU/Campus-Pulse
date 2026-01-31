import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../services/alert_service.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard>
    with SingleTickerProviderStateMixin {
  final AlertService _alertService = AlertService();
  late TabController _tabController;

  String selectedType = 'All';
  bool newestFirst = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  String alertDuration(Timestamp createdAt) {
    final diff = DateTime.now().difference(createdAt.toDate());
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes} min';
    if (diff.inHours < 24) return '${diff.inHours} hr';
    return '${diff.inDays} day(s)';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Campus Pulse – Admin'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'All'),
            Tab(text: 'Active'),
            Tab(text: 'Resolved'),
            Tab(text: 'False Alerts'),
          ],
        ),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                /// 🔥 STYLED FILTER DROPDOWN
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surface,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: selectedType,
                      borderRadius: BorderRadius.circular(14),
                      icon: const Icon(Icons.keyboard_arrow_down),
                      items: const [
                        DropdownMenuItem(
                          value: 'All',
                          child: Text('All Alerts'),
                        ),
                        DropdownMenuItem(value: 'Fire', child: Text('Fire')),
                        DropdownMenuItem(
                          value: 'Medical',
                          child: Text('Medical'),
                        ),
                        DropdownMenuItem(
                          value: 'Safety',
                          child: Text('Safety'),
                        ),
                      ],
                      onChanged: (v) => setState(() => selectedType = v!),
                    ),
                  ),
                ),
                const Spacer(),
                IconButton(
                  tooltip: newestFirst ? 'Newest first' : 'Oldest first',
                  icon: Icon(
                    newestFirst ? Icons.arrow_downward : Icons.arrow_upward,
                  ),
                  onPressed: () => setState(() => newestFirst = !newestFirst),
                ),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                alertList(_alertService.streamAllAlerts()),
                alertList(_alertService.streamActiveAlerts()),
                alertList(_alertService.streamResolvedAlerts()),
                alertList(
                  _alertService.streamResolvedAlerts(),
                  falseOnly: true,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget alertList(Stream<QuerySnapshot> stream, {bool falseOnly = false}) {
    return StreamBuilder<QuerySnapshot>(
      stream: stream,
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return const Center(child: Text('Something went wrong'));
        }
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        final docs = snapshot.data!.docs;
        if (docs.isEmpty) {
          return const Center(child: Text('No alerts'));
        }

        List<QueryDocumentSnapshot> filtered = docs;

        if (falseOnly) {
          filtered = filtered.where((d) {
            final data = d.data() as Map<String, dynamic>;
            return data['isFalseReport'] == true;
          }).toList();
        }

        if (selectedType != 'All') {
          filtered = filtered.where((d) => d['type'] == selectedType).toList();
        }

        filtered.sort((a, b) {
          final at = a['createdAt'] as Timestamp;
          final bt = b['createdAt'] as Timestamp;
          return newestFirst ? bt.compareTo(at) : at.compareTo(bt);
        });

        final adminUid = FirebaseAuth.instance.currentUser!.uid;

        return ListView.builder(
          itemCount: filtered.length,
          itemBuilder: (context, index) {
            final data = filtered[index].data() as Map<String, dynamic>;

            Color color;
            IconData icon;

            switch (data['type']) {
              case 'Fire':
                color = Colors.red;
                icon = Icons.local_fire_department;
                break;
              case 'Medical':
                color = Colors.green;
                icon = Icons.medical_services;
                break;
              default:
                color = Colors.orange;
                icon = Icons.warning;
            }

            return Card(
              margin: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              elevation: 3,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(18),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        CircleAvatar(
                          backgroundColor: color,
                          child: Icon(icon, color: Colors.white),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            data['type'],
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        Chip(
                          label: Text(
                            data['status'].toUpperCase(),
                            style: TextStyle(color: color),
                          ),
                          backgroundColor: color.withValues(alpha: .1),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    if (data['message']?.isNotEmpty == true)
                      Text(
                        data['message'],
                        maxLines: 3,
                        overflow: TextOverflow.ellipsis,
                      ),
                    if (data['locationHint'] != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 6),
                        child: Row(
                          children: [
                            const Icon(Icons.location_on, size: 16),
                            const SizedBox(width: 4),
                            Text(data['locationHint']),
                          ],
                        ),
                      ),
                    const SizedBox(height: 14),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          data['status'] == 'active'
                              ? 'Active • ${alertDuration(data['createdAt'])}'
                              : data['isFalseReport'] == true
                              ? 'False Alert'
                              : 'Resolved',
                          style: const TextStyle(fontSize: 12),
                        ),
                        if (data['status'] == 'active')
                          Wrap(
                            spacing: 12,
                            children: [
                              /// ✅ PROFESSIONAL RESOLVE BUTTON
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF2563EB),
                                  foregroundColor: Colors.white,
                                  elevation: 0,
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 22,
                                    vertical: 14,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                ),
                                onPressed: () => _alertService.resolveAlert(
                                  filtered[index].id,
                                  adminUid,
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.check_circle_outline, size: 18),
                                    SizedBox(width: 8),
                                    Text(
                                      'Resolve Issue',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              /// ❌ FALSE ALERT BUTTON
                              OutlinedButton(
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.grey.shade700,
                                  side: BorderSide(color: Colors.grey.shade300),
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 22,
                                    vertical: 14,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                ),
                                onPressed: () => _alertService.markFalseReport(
                                  filtered[index].id,
                                  adminUid,
                                ),
                                child: const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.flag_outlined, size: 18),
                                    SizedBox(width: 8),
                                    Text(
                                      'False Alert',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }
}
