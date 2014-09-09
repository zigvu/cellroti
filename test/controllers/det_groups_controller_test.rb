require 'test_helper'

class DetGroupsControllerTest < ActionController::TestCase
  setup do
    @det_group = det_groups(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:det_groups)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create det_group" do
    assert_difference('DetGroup.count') do
      post :create, det_group: { name: @det_group.name, user_id: @det_group.user_id }
    end

    assert_redirected_to det_group_path(assigns(:det_group))
  end

  test "should show det_group" do
    get :show, id: @det_group
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @det_group
    assert_response :success
  end

  test "should update det_group" do
    patch :update, id: @det_group, det_group: { name: @det_group.name, user_id: @det_group.user_id }
    assert_redirected_to det_group_path(assigns(:det_group))
  end

  test "should destroy det_group" do
    assert_difference('DetGroup.count', -1) do
      delete :destroy, id: @det_group
    end

    assert_redirected_to det_groups_path
  end
end
