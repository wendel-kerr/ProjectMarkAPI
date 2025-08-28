#!/bin/bash

# Seed default users
curl -s -X POST http://localhost:3000/auth/seed-defaults -H 'Content-Type: application/json' -d '{}'

echo "Viewer token: $viewer_token"

# Login como editor
editor_response=$(curl -s -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"editor@example.com","password":"password"}')
echo "Editor login response: $editor_response"
editor_token=$(echo "$editor_response" | jq -r .token)
echo "Editor token: $editor_token"

echo "Root topic id: $root_id"


# Criar root topic (sem parentId) com editor, nome único
unique_name="RootT_$(date +%s)"
root_response=$(curl -s -X POST http://localhost:3000/topics \
  -H "Authorization: Bearer $editor_token" \
  -H 'Content-Type: application/json' \
  -d "{\"name\":\"$unique_name\",\"content\":\"T\"}")
echo "Root topic response: $root_response"
root_id=$(echo "$root_response" | jq -r .id)
echo "Root topic id: $root_id"


# Criar child topic somente se root_id for válido
if [ "$root_id" != "null" ] && [ -n "$root_id" ]; then
  child_response=$(curl -s -X POST http://localhost:3000/topics \
    -H "Authorization: Bearer $editor_token" \
    -H 'Content-Type: application/json' \
    -d "{\"name\":\"ChildT\",\"content\":\"CT\",\"parentId\":\"$root_id\"}")
  echo "Child topic response: $child_response"

  # Buscar árvore
  tree_response=$(curl -s -X GET http://localhost:3000/topics/$root_id/tree \
    -H "Authorization: Bearer $editor_token")
  echo "Tree response: $tree_response"
  children_count=$(echo "$tree_response" | jq '.children | length')
  echo "Children count: $children_count"
  if [ "$children_count" -gt 0 ] 2>/dev/null; then
    echo "Tree structure OK"
  else
    echo "Tree structure FAIL"
  fi
else
  echo "Root topic não criado corretamente."
fi
