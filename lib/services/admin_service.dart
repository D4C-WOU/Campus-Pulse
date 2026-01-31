import 'package:cloud_firestore/cloud_firestore.dart';

class AdminService {
  final CollectionReference admins = FirebaseFirestore.instance.collection(
    'admins',
  );

  Future<bool> isAdmin(String uid) async {
    final doc = await admins.doc(uid).get();
    return doc.exists;
  }
}
