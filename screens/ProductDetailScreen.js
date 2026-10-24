import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { getProduct } from '../api';

export default function ProductDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProduct(id);
      setProduct(data);
      navigation.setOptions({ title: data.title });
    } catch (e) {
      setError(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [id, navigation]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <ActivityIndicator size="large" style={styles.center} />;

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: product.thumbnail }} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{product.title}</Text>
      <Text style={styles.price}>${product.price}</Text>
      <Text style={styles.meta}>
        {product.category}
        {product.brand ? ` · ${product.brand}` : ''}
        {product.rating != null ? ` · ★ ${product.rating}` : ''}
      </Text>
      <Text style={styles.description}>{product.description}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  center: { flex: 1, marginTop: 48, alignItems: 'center' },
  image: { width: '100%', height: 260, backgroundColor: '#f2f2f2', borderRadius: 8 },
  title: { fontSize: 22, fontWeight: 'bold', marginTop: 16 },
  price: { fontSize: 20, color: '#4f46e5', marginTop: 4 },
  meta: { fontSize: 13, color: '#888', marginTop: 8 },
  description: { fontSize: 15, lineHeight: 22, marginTop: 16, marginBottom: 32 },
  errorText: { color: '#dc2626', marginBottom: 12 },
  retryBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: { color: '#fff', fontWeight: '600' },
});