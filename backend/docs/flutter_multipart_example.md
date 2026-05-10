# Flutter Multipart Upload Example

Backend endpoint:
- `POST /api/v1/analyses/upload`
- Content-Type: `multipart/form-data`
- Fields:
  - `user_id` (required)
  - `weight` (optional)
  - `image` (required file)

```dart
import 'dart:io';
import 'package:dio/dio.dart';

class AnalysisApi {
  AnalysisApi(this.baseUrl);
  final String baseUrl;
  final Dio dio = Dio();

  Future<Map<String, dynamic>> uploadAnalysis({
    required int userId,
    required File imageFile,
    double? weight,
  }) async {
    final formData = FormData.fromMap({
      'user_id': userId.toString(),
      if (weight != null) 'weight': weight.toString(),
      'image': await MultipartFile.fromFile(
        imageFile.path,
        filename: imageFile.uri.pathSegments.last,
      ),
    });

    final response = await dio.post(
      '$baseUrl/api/v1/analyses/upload',
      data: formData,
      options: Options(
        headers: {'Content-Type': 'multipart/form-data'},
      ),
    );

    return Map<String, dynamic>.from(response.data as Map);
  }
}
```

Minimal usage:

```dart
final api = AnalysisApi('http://10.0.2.2:8000'); // Android emulator -> localhost
final result = await api.uploadAnalysis(
  userId: 1,
  imageFile: File('/path/to/selfie.jpg'),
  weight: 64.7,
);
print(result);
```
